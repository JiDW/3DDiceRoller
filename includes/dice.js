"use strict";

(function(dice) {

    function prepare_rnd(callback) {
        if (!random_storage.length && $t.dice.use_true_random) {
            try {
                $t.rpc({ method: "random", n: 512 }, 
                function(response) {
                    if (response.method != 'random') return;
                    if (!response.error)
                        random_storage = response.result.random.data;
                    else $t.dice.use_true_random = false;
                    callback();
                });
                return;
            }
            catch (e) { $t.dice.use_true_random = false; }
        }
        callback();
    }

    function rnd() {
        return random_storage.length ? random_storage.pop() : Math.random();
    }

    function range(start, stop, step = 1) {
        var a = [start], b = start;
        while (b < stop) {
            a.push(b += step || 1);
        }
        return a;
    }

    let random_storage = [];

    this.use_true_random = false;
    this.frame_rate = 1 / 60;
    this.known_types = ['df', 'd1', 'd2', 'd3', 'd4', 'd6', 'dsex', 'd8', 'd10', 'd100', 'd12', 'd20'];
    this.selector_dice = ['d4', 'd6', 'd8', 'd10', 'd100', 'd12', 'd20'];
    this.ambient_light_color = 0xf0f5fb;
    this.spot_light_color = 0xefdfd5;
    this.selector_back_colors = { color: '#1e2c4d', shininess: 0 };
    this.desk_color = '#1e2c4d';//0xdfdfdf;
    this.use_shadows = true;

    this.parse_notation = function(notation) {
        return new DiceNotation(notation);
    }

    this.stringify_notation = function(notation) {
        return notation.stringify();
    }

    this.test_notations = function(teststring = '') {

        let teststrings = [];

        if (teststring != '') {
            teststrings.push(teststring);
        } else {
            teststrings = [
                '8',
                '10',
                '100',
                '8h1',
                '10h1',
                '100h1',
                '8h20',
                '10h4000',
                '800l098029384@8,8,8,8,8',
                '+7',
                '+10',
                '+100',
                '1d4',
                '1d4+8d6l+4dsex+7',
                '10d4',
                '10d20',
                '10d20+7',
                '8d4h4',
                '8d4h4+7',
                '10d4l2',
                '10d20',
                '10d20+7',
                '4dsex',
                '4dwww+',
                'ddab',
                'ddif',
                'dpro',
                'dcha',
                'dfor',
                'dboo',
                'dset'
            ];
        }

        for(let i = 0, l = teststrings.length; i < l; i++){
            console.log(i, teststrings[i]);

            let parsed = this.parse_notation(teststrings[i]);
            console.log('parse_notation', parsed);

            let stringified = this.stringify_notation(parsed);
            console.log('stringify_notation', stringified);
        }
    }

    var that = this;

    this.dice_box = function(container, dimentions) {
        this.use_adaptive_timestep = false;
        this.animate_selector = true;
        this.selector_rotate = true;

        this.dices = [];
        this.scene = new THREE.Scene();
        this.world = new CANNON.World();
        this.raycaster = new THREE.Raycaster();
        this.rayvisual = null;
        this.showdebugtracer = false;
        this.mouse = new THREE.Vector2();

        this.renderer = window.WebGLRenderingContext
            ? new THREE.WebGLRenderer({ antialias: true })
            : new THREE.CanvasRenderer({ antialias: true });
        container.appendChild(this.renderer.domElement);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0xffffff, 1);

        this.reinit(container, dimentions);

        this.world.gravity.set(0, 0, -9.8 * 800);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 14;

        var ambientLight = new THREE.AmbientLight(that.ambient_light_color, 1);
        this.scene.add(ambientLight);

        this.dice_body_material = new CANNON.Material();
        var desk_body_material = new CANNON.Material();
        var barrier_body_material = new CANNON.Material();
        this.world.addContactMaterial(new CANNON.ContactMaterial(
                    desk_body_material, this.dice_body_material, {friction: 0.01, restitution: 0.5}));
        this.world.addContactMaterial(new CANNON.ContactMaterial(
                    barrier_body_material, this.dice_body_material, {friction: 0, restitution: 1.0}));
        this.world.addContactMaterial(new CANNON.ContactMaterial(
                    this.dice_body_material, this.dice_body_material, {friction: 0, restitution: 0.5}));

        this.world.add(new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: desk_body_material}));
        var barrier;
        barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
        barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
        barrier.position.set(0, this.h * 0.93, 0);
        this.world.add(barrier);

        barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
        barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        barrier.position.set(0, -this.h * 0.93, 0);
        this.world.add(barrier);

        barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
        barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
        barrier.position.set(this.w * 0.93, 0, 0);
        this.world.add(barrier);

        barrier = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: barrier_body_material});
        barrier.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        barrier.position.set(-this.w * 0.93, 0, 0);
        this.world.add(barrier);

        this.last_time = 0;
        this.running = false;

        if (this.showdebugtracer) {
            //this.raycaster.setFromCamera( this.mouse, this.camera );
            this.rayvisual = new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 1000, 0xff0000);
            this.scene.add(this.rayvisual);
        }

        this.renderer.render(this.scene, this.camera);

        document.addEventListener('mousemove', this.onmousemove, false);
    }

    this.dice_box.prototype.onmousemove = function(event) {

        event.preventDefault();

        var clientX = (event.changedTouches && event.changedTouches.length) ? event.changedTouches[0].clientX : event.clientX;
        var clientY = (event.changedTouches && event.changedTouches.length) ? event.changedTouches[0].clientY : event.clientY;


        /*
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse
        var dir = new THREE.Vector3(); // create once and reuse

        vec.set(
            ( clientX / window.innerWidth ) * 2 - 1,
            - ( clientY / window.innerHeight ) * 2 + 1,
            0.5 );

        $t.box.mouse.x = vec.x;
        $t.box.mouse.y = vec.y;

        vec.unproject( $t.box.camera );

        vec.sub( $t.box.camera.position ).normalize();

        var distance = ( 0.5 - $t.box.camera.position.z ) / vec.z;

        pos.copy( $t.box.camera.position ).add( vec.multiplyScalar( distance ) );

        dir.subVectors($t.box.camera.position, pos).normalize();

        //$t.box.camera.lookAt(pos);
        $t.box.raycaster.set($t.box.camera.position, dir);
        $t.box.rayvisual.setDirection($t.box.raycaster.ray.direction);
        $t.box.rayvisual.position.set(pos.x,pos.y,pos.z);
        */

        $t.box.mouse.x = ( clientX / window.innerWidth ) * 2 - 1;
        $t.box.mouse.y = - ( clientY / window.innerHeight ) * 2 + 1;

        $t.box.mouse.y -= 0.25; // dumb fix for positioning of ray tracer

        if ($t.box.raycaster && $t.box.showdebugtracer) {
            $t.box.raycaster.setFromCamera($t.box.mouse, $t.box.camera);
            $t.box.rayvisual.setDirection($t.box.raycaster.ray.direction);
        }
    }

    this.dice_box.prototype.reinit = function(container, dimentions) {
        this.cw = container.clientWidth / 2;
        this.ch = container.clientHeight / 2;
        if (dimentions) {
            this.w = dimentions.w;
            this.h = dimentions.h;
        }
        else {
            this.w = this.cw;
            this.h = this.ch;
        }
        this.aspect = Math.min(this.cw / this.w, this.ch / this.h);
        that.scale = Math.sqrt(this.w * this.w + this.h * this.h) / 13;

        this.renderer.setSize(this.cw * 2, this.ch * 2);

        this.wh = this.ch / this.aspect / Math.tan(10 * Math.PI / 180);
        this.cameraheight_selector = this.wh / 1.5;
        this.cameraheight_selector_all = this.wh;
        this.cameraheight_rolling = this.wh;
        if (this.camera) this.scene.remove(this.camera);
        this.camera = new THREE.PerspectiveCamera(20, this.cw / this.ch, 1, this.wh * 1.3);
        this.camera.position.z = this.alldice ? this.cameraheight_selector_all : this.cameraheight_selector;
        this.camera.lookAt(new THREE.Vector3(0,0,0));
        

        var mw = Math.max(this.w, this.h);
        if (this.light) this.scene.remove(this.light);
        this.light = new THREE.SpotLight(that.spot_light_color, 1.0);
        this.light.position.set(-mw / 2, mw / 2, mw * 2);
        this.light.target.position.set(0, 0, 0);
        this.light.distance = mw * 5;
        this.light.castShadow = true;
        this.light.shadow.camera.near = mw / 10;
        this.light.shadow.camera.far = mw * 5;
        this.light.shadow.camera.fov = 50;
        this.light.shadow.bias = 0.001;
        this.light.shadow.mapSize.width = 1024;
        this.light.shadow.mapSize.height = 1024;
        this.scene.add(this.light);

        if (this.desk) this.scene.remove(this.desk);
        this.desk = new THREE.Mesh(new THREE.PlaneGeometry(this.w * 6, this.h * 6, 1, 1), 
                new THREE.MeshPhongMaterial({ color: that.desk_color }));
        this.desk.receiveShadow = that.use_shadows;
        this.scene.add(this.desk);

        if (this.rayvisual && this.showdebugtracer) {
            this.rayvisual = new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 1000, 0xff0000);
            this.scene.add(this.rayvisual);
        }

        this.renderer.render(this.scene, this.camera);
    }

    function make_random_vector(vector) {
        var random_angle = rnd() * Math.PI / 5 - Math.PI / 5 / 2;
        var vec = {
            x: vector.x * Math.cos(random_angle) - vector.y * Math.sin(random_angle),
            y: vector.x * Math.sin(random_angle) + vector.y * Math.cos(random_angle)
        };
        if (vec.x == 0) vec.x = 0.01;
        if (vec.y == 0) vec.y = 0.01;
        return vec;
    }

    this.dice_box.prototype.generate_vectors = function(notation, vector, boost) {
        var vectors = [];
        for (var i in notation.set) {

            const diceobj = $t.DiceFactory.get(notation.set[i].type);
            let numdice = notation.set[i].num;
            let operator = notation.set[i].op;

            for(let k = 0; k < numdice; k++){

                var vec = make_random_vector(vector);
                var pos = {
                    x: this.w * (vec.x > 0 ? -1 : 1) * 0.9,
                    y: this.h * (vec.y > 0 ? -1 : 1) * 0.9,
                    z: rnd() * 200 + 200
                };
                var projector = Math.abs(vec.x / vec.y);
                if (projector > 1.0) pos.y /= projector; else pos.x *= projector;
                var velvec = make_random_vector(vector);
                var velocity = { x: velvec.x * (boost * notation.boost), y: velvec.y * (boost * notation.boost), z: -10 };

                var angle = {
                    x: -(rnd() * vec.y * 5 + diceobj.inertia * vec.y),
                    y: rnd() * vec.x * 5 + diceobj.inertia * vec.x,
                    z: 0
                };
                var axis = { x: rnd(), y: rnd(), z: rnd(), a: rnd() };
                vectors.push({ set: diceobj.type, op: operator, pos: pos, velocity: velocity, angle: angle, axis: axis });
            }            
        }
        return vectors;
    }

    this.dice_box.prototype.create_dice = function(type, operator, pos, velocity, angle, axis) {

        const diceobj = $t.DiceFactory.get(type);
        if(!diceobj) return;

        let dicemesh = $t.DiceFactory.create(diceobj.type);
        if(!dicemesh) return;

        dicemesh.castShadow = true;
        dicemesh.dice_type = type;
        dicemesh.dice_operator = operator;
        dicemesh.body = new CANNON.Body({mass: diceobj.mass, shape: dicemesh.geometry.cannon_shape, material: this.dice_body_material});
        dicemesh.body.position.set(pos.x, pos.y, pos.z);
        dicemesh.body.quaternion.setFromAxisAngle(new CANNON.Vec3(axis.x, axis.y, axis.z), axis.a * Math.PI * 2);
        dicemesh.body.angularVelocity.set(angle.x, angle.y, angle.z);
        dicemesh.body.velocity.set(velocity.x, velocity.y, velocity.z);
        dicemesh.body.linearDamping = 0.1;
        dicemesh.body.angularDamping = 0.1;
        this.scene.add(dicemesh);
        this.dices.push(dicemesh);
        this.world.add(dicemesh.body);
    }

    this.dice_box.prototype.check_if_throw_finished = function() {
        var res = true;
        var e = 6;
        if (this.iteration < 10 / that.frame_rate) {
            for (var i = 0; i < this.dices.length; ++i) {
                var dice = this.dices[i];
                if (dice.dice_stopped === true) continue;
                var a = dice.body.angularVelocity, v = dice.body.velocity;
                if (Math.abs(a.x) < e && Math.abs(a.y) < e && Math.abs(a.z) < e &&
                        Math.abs(v.x) < e && Math.abs(v.y) < e && Math.abs(v.z) < e) {
                    if (dice.dice_stopped) {
                        if (this.iteration - dice.dice_stopped > 3) {
                            dice.dice_stopped = true;
                            continue;
                        }
                    }
                    else dice.dice_stopped = this.iteration;
                    res = false;
                }
                else {
                    dice.dice_stopped = undefined;
                    res = false;
                }
            }
        }
        return res;
    }

    function get_dice_value(dicemesh) {
        var vector = new THREE.Vector3(0, 0, dicemesh.dice_type == 'd4' ? -1 : 1);
        var closest_face, closest_angle = Math.PI * 2;
        for (var i = 0, l = dicemesh.geometry.faces.length; i < l; ++i) {
            var face = dicemesh.geometry.faces[i];
            if (face.materialIndex == 0) continue;
            var angle = face.normal.clone().applyQuaternion(dicemesh.body.quaternion).angleTo(vector);
            if (angle < closest_angle) {
                closest_angle = angle;
                closest_face = face;
            }
        }
        var matindex = closest_face.materialIndex - 1;
        const diceobj = $t.DiceFactory.get(dicemesh.dice_type);

        if (dicemesh.dice_type == 'd4') return {value: matindex, label: '', mesh: dicemesh};
        if (dicemesh.dice_type == 'd10' || dicemesh.dice_type == 'd100') matindex += 1;

        let value = diceobj.values[((matindex-1) % diceobj.values.length)];
        let label = diceobj.labels[(((matindex-1) % (diceobj.labels.length-2))+2)];

        return {value: value, label: label, mesh: dicemesh};
    }

    function get_dice_values(dices) {

        let d100list = [];
        let results = {
            values: [],
            labels: [],
            dice: [],
        };

        for (let i = 0; i < dices.length; ++i) {

            let dicemesh = dices[i];

            const diceobj = $t.DiceFactory.get(dicemesh.dice_type);
            if(diceobj == null) continue;

            let value = get_dice_value(dicemesh);

            // check for d100+d10 pairs, correct the values if needed
            if (dicemesh.dice_type == 'd10' && d100list.length > 0) {

                let lastd100 = d100list.pop();

                if (results.values[lastd100] == 100 && value.value != 10) {
                    results.values[lastd100] = 0;
                }
                if (value.value == 10) {
                    value.value = 0;
                }
            }

            let newindex = results.values.push(value.value);

            if (dicemesh.dice_type == 'd100') {
                d100list.push((newindex-1));
            }

            results.labels.push(value.label);
            results.dice.push(dicemesh);
        }

        return results;
    }

    this.dice_box.prototype.emulate_throw = function() {
        while (!this.check_if_throw_finished()) {
            ++this.iteration;
            this.world.step(that.frame_rate);
        }
        return get_dice_values(this.dices).values;
    }

    this.dice_box.prototype.__animate = function(threadid) {
        var time = (new Date()).getTime();
        var time_diff = (time - this.last_time) / 1000;
        if (time_diff > 3) time_diff = that.frame_rate;
        ++this.iteration;
        if (this.use_adaptive_timestep) {
            while (time_diff > that.frame_rate * 1.1) {
                this.world.step(that.frame_rate);
                time_diff -= that.frame_rate;
            }
            this.world.step(time_diff);
        }
        else {
            this.world.step(that.frame_rate);
        }
        for (var i in this.scene.children) {
            var interact = this.scene.children[i];
            if (interact.body != undefined) {
                interact.position.copy(interact.body.position);
                interact.quaternion.copy(interact.body.quaternion);
            }
        }
        this.renderer.render(this.scene, this.camera);
        this.last_time = this.last_time ? time : (new Date()).getTime();
        if (this.running == threadid && this.check_if_throw_finished()) {
            this.running = false;
            if (this.callback) this.callback.call(this, get_dice_values(this.dices));
        }
        if (this.running == threadid) {
            (function(t, tid, uat) {
                if (!uat && time_diff < that.frame_rate) {
                    setTimeout(function() { requestAnimationFrame(function() { t.__animate(tid); }); }, (that.frame_rate - time_diff) * 1000);
                }
                else requestAnimationFrame(function() { t.__animate(tid); });
            })(this, threadid, this.use_adaptive_timestep);
        }
    }

    this.dice_box.prototype.clear = function() {
        this.running = false;
        var dice;
        while (dice = this.dices.pop()) {
            this.scene.remove(dice); 
            if (dice.body) this.world.remove(dice.body);
        }
        if (this.pane) this.scene.remove(this.pane);
        this.renderer.render(this.scene, this.camera);
        var box = this;
        setTimeout(function() { box.renderer.render(box.scene, box.camera); }, 100);
    }

    this.dice_box.prototype.prepare_dices_for_roll = function(vectors) {
        this.clear();
        this.iteration = 0;
        for (var i in vectors) {
            this.create_dice(vectors[i].set, vectors[i].op, vectors[i].pos, vectors[i].velocity, vectors[i].angle, vectors[i].axis);
        }
    }

    function shift_dice_faces(dice, value, result) {
        if (dice.dice_type == 'd4') {
            shift_d4_faces(dice, value, result);
            return;
        }


        const diceobj = $t.DiceFactory.get(dice.dice_type);
        let values = diceobj.values;

        value = parseInt(value);
        
        if (dice.dice_type == 'd10' && value == 0) value = 10;
        if (dice.dice_type == 'd100' && value == 0) value = 100;
        if (dice.dice_type == 'd100' && (value > 0 && value < 10)) value *= 10;

        let valueindex = values.indexOf(value);
        let resultindex = values.indexOf(result);

        if (valueindex < 0 || resultindex < 0) return;
        if (valueindex == resultindex) return;

        // find material index for correspondig value -> face
        // and swap them
        let geom = dice.geometry.clone();

        // find list of faces that use the matching material index for the given value/result
        let geomindex_value = [];
        let geomindex_result = [];

        // it's magic but not really
        // the mesh's materials start at index 2
        var magic = 2;
        // except on d10 meshes
        if (dice.dice_type == 'd100' || dice.dice_type == 'd10') magic = 1;

        let material_value = (valueindex+magic);
        let material_result = (resultindex+magic);

        for (var i = 0, l = geom.faces.length; i < l; ++i) {
            var matindex = geom.faces[i].materialIndex;

            if (matindex == material_value) {
                geomindex_value.push(i);
                continue;
            }
            if (matindex == material_result) {
                geomindex_result.push(i);
                continue;
            }
        }

        if (geomindex_value.length <= 0 || geomindex_result.length <= 0) return;

        //swap the materials
        for(let i = 0, l = geomindex_value.length; i < l; i++) {
            geom.faces[geomindex_value[i]].materialIndex = material_result;
        }

        for(let i = 0, l = geomindex_result.length; i < l; i++) {
            geom.faces[geomindex_result[i]].materialIndex = material_value;
        }

        dice.geometry = geom;
    }

    function shift_d4_faces(dice, value, res) {
        if (!(value >= 1 && value <= 4)) return;
        var num = value - res;
        var geom = dice.geometry.clone();
        for (var i = 0, l = geom.faces.length; i < l; ++i) {
            var matindex = geom.faces[i].materialIndex;
            if (matindex == 0) continue;
            matindex += num - 1;
            while (matindex > 4) matindex -= 4;
            while (matindex < 1) matindex += 4;
            geom.faces[i].materialIndex = matindex + 1;
        }
        if (dice.dice_type == 'd4' && num != 0) {
            if (num < 0) num += 4;

            const diceobj = $t.DiceFactory.get(dice.dice_type);

            dice.material = $t.DiceFactory.createTextMeterial(diceobj, diceobj.labels[num]);
        }
        dice.geometry = geom;
    }

    this.dice_box.prototype.roll = function(vectors, values, callback) {

        this.camera.position.z = this.cameraheight_rolling;
        this.prepare_dices_for_roll(vectors);
        if (values != undefined && values.length) {
            this.use_adaptive_timestep = false;
            var res = this.emulate_throw();
            this.prepare_dices_for_roll(vectors);
            for (var i in res)
                shift_dice_faces(this.dices[i], values[i], res[i]);
        }
        this.callback = callback;
        this.running = (new Date()).getTime();
        this.last_time = 0;
        this.__animate(this.running);
    }

    this.INTERSECTED;

    this.dice_box.prototype.__selector_animate = function(threadid) {
        var time = (new Date()).getTime();
        var time_diff = (time - this.last_time) / 1000;
        if (time_diff > 3) time_diff = that.frame_rate;

        if (this.selector_rotate) {
            //var angle_change = 0.3 * time_diff * Math.PI * Math.min(24000 + threadid - time, 6000) / 6000;
            var angle_change = 0.005 * Math.PI;
            if (angle_change < 0) this.running = false;
            for (var i in this.dices) {
                this.dices[i].rotation.y += angle_change;
                this.dices[i].rotation.x += angle_change / 4;
                this.dices[i].rotation.z += angle_change / 10;
            }
        }

        this.raycaster.setFromCamera( this.mouse, this.camera );
        if (this.rayvisual) this.rayvisual.setDirection(this.raycaster.ray.direction);
        var intersects = this.raycaster.intersectObjects(this.dices);
        if ( intersects.length > 0 ) {

            if ( this.INTERSECTED != intersects[0].object ) {
                
                if ( this.INTERSECTED ) {
                    for(let i = 0, l = this.INTERSECTED.material.length; i < l; i++){
                        if (i == 0) continue;
                        this.INTERSECTED.material[i].emissive.setHex( this.INTERSECTED.currentHex );
                        this.INTERSECTED.material[i].emissiveIntensity = this.INTERSECTED.currentintensity;
                    }
                }

                this.INTERSECTED = intersects[0].object;
                this.INTERSECTED.currentHex = this.INTERSECTED.material[1].emissive.getHex();
                this.INTERSECTED.currentintensity = this.INTERSECTED.material[1].emissiveIntensity;

                for(let i = 0, l = this.INTERSECTED.material.length; i < l; i++){
                    if (i == 0) continue;
                    this.INTERSECTED.material[i].emissive.setHex( 0xffffff );
                    this.INTERSECTED.material[i].emissiveIntensity = 0.5;
                }
            }
        } else {
                if ( this.INTERSECTED ) {
                    for(let i = 0, l = this.INTERSECTED.material.length; i < l; i++){
                        if (i == 0) continue;
                        this.INTERSECTED.material[i].emissive.setHex( this.INTERSECTED.currentHex );
                        this.INTERSECTED.material[i].emissiveIntensity = this.INTERSECTED.currentintensity;
                    }
                }
                this.INTERSECTED = null;
        }

        this.last_time = time;
        this.renderer.render(this.scene, this.camera);
        if (this.running == threadid) {
            (function(t, tid) {
                requestAnimationFrame(function() { t.__selector_animate(tid); });
            })(this, threadid);
        }
    }

    this.dice_box.prototype.search_dice_by_mouse = function(ev) {

        if (this.rolling) return;
        if (ev) this.onmousemove(ev);

        this.raycaster.setFromCamera( this.mouse, this.camera );
        if (this.rayvisual) this.rayvisual.setDirection(this.raycaster.ray.direction);
        var intersects = this.raycaster.intersectObjects(this.dices);

        //this.scene.add(new THREE.ArrowHelper(this.raycaster.ray.direction, this.raycaster.ray.origin, 1000, 0x00ff00) );

        if (intersects.length) return intersects[0].object.userData;
    }

    this.dice_box.prototype.draw_selector = function(alldice = false) {
        this.clear();
        var step = this.w / 4.5;

        this.pane = new THREE.Mesh(new THREE.PlaneGeometry(this.w * 6, this.h * 6, 1, 1), 
                new THREE.MeshPhongMaterial(that.selector_back_colors));
        this.pane.receiveShadow = true;
        this.pane.position.set(0, 0, 1);
        this.scene.add(this.pane);

        let dicelist = alldice ? Object.keys($t.DiceFactory.dice) : that.selector_dice;
        this.camera.position.z = dicelist.length > 9 ? this.cameraheight_selector_all : this.cameraheight_selector;
        let posxstart = dicelist.length > 9 ? -4 : (dicelist.length < 3 ? -0.5 : -1);
        let posystart = dicelist.length > 9 ? 1.5 : (dicelist.length < 4 ? 0 : 1);
        let poswrap = dicelist.length > 9 ? 4 : (dicelist.length < 4 ? 2 : 1);

        for (var i = 0, posx = posxstart, posy = posystart; i < dicelist.length; ++i, ++posx) {

            if (posx > poswrap) {
                posx = posxstart;
                posy--;
            }

            var dicemesh = $t.DiceFactory.create(dicelist[i]);
            dicemesh.position.set(posx * step, posy * step, step * 0.5);
            dicemesh.castShadow = true;
            dicemesh.userData = dicelist[i];

            this.dices.push(dicemesh);
            this.scene.add(dicemesh);
        }

        this.running = (new Date()).getTime();
        this.last_time = 0;
        if (this.animate_selector) this.__selector_animate(this.running);
        else this.renderer.render(this.scene, this.camera);
    }

    function throw_dices(box, vector, boost, dist, notation_getter, before_roll, after_roll) {
        var uat = $t.dice.use_adaptive_timestep;
        function roll(request_results) {
            if (after_roll) {
                box.clear();
                box.roll(vectors, request_results || notation.result, function(result) {
                    if (after_roll) after_roll.call(box, notation, result);
                    box.rolling = false;
                    $t.dice.use_adaptive_timestep = uat;
                });
            }
        }
        vector.x /= dist; vector.y /= dist;
        var notation = notation_getter.call(box);
        if (notation.set.length == 0) return;
        var vectors = box.generate_vectors(notation, vector, boost);
        box.rolling = true;
        box.camera.position.z = box.cameraheight_rolling;
        if (before_roll) before_roll.call(box, vectors, notation, roll);
        else roll();
    }

    this.dice_box.prototype.bind_mouse = function(container, notation_getter, before_roll, after_roll) {
        var box = this;
        $t.bind(container, ['mousedown', 'touchstart'], function(ev) {
            ev.preventDefault();
            box.mouse_time = (new Date()).getTime();
            box.mouse_start = $t.get_mouse_coords(ev);
        });
        $t.bind(container, ['mouseup', 'touchend'], function(ev) {
            if (box.rolling) return;
            if (box.mouse_start == undefined) return;
            if (box.mouse_start && ev.changedTouches && ev.changedTouches.length == 0) {
                return;
            }
            ev.stopPropagation();
            var m = $t.get_mouse_coords(ev);
            var vector = { x: m.x - box.mouse_start.x, y: -(m.y - box.mouse_start.y) };
            box.mouse_start = undefined;
            var dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            if (dist < Math.sqrt(box.w * box.h * 0.01)) return;
            var time_int = (new Date()).getTime() - box.mouse_time;
            if (time_int > 2000) time_int = 2000;
            var boost = Math.sqrt((2500 - time_int) / 2500) * dist * 2;
            prepare_rnd(function() {
                throw_dices(box, vector, boost, dist, notation_getter, before_roll, after_roll);
            });
        });
    }

    this.dice_box.prototype.bind_throw = function(button, notation_getter, before_roll, after_roll) {
        var box = this;
        $t.bind(button, ['mouseup', 'touchend'], function(event) {
            event.stopPropagation();
            box.start_throw(notation_getter, before_roll, after_roll, event);
        });
    }

    this.dice_box.prototype.start_throw = function(notation_getter, before_roll, after_roll) {
        var box = this;
        if (box.rolling) return;
        prepare_rnd(function() {
            var vector = { x: (rnd() * 2 - 1) * box.w, y: -(rnd() * 2 - 1) * box.h };
            var dist = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            var boost = (rnd() + 3) * dist;
            throw_dices(box, vector, boost, dist, notation_getter, before_roll, after_roll);
        });
    }

}).apply(teal.dice = teal.dice || {});

