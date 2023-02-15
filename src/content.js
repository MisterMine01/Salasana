var Salasana = new class {
    constructor() {
        var url = window.top.location.href
        this._seed = url.split('/')[2];
        console.log(this._seed);
        (async () => {
            await this.reset(true);
            await this.init();
        })();
    }

    async reset(atStart = false) {
        this._passwords = (await this.getAt('key')) || "";
        console.log(this._passwords)
        this._isView = (await this.getAt('isView')) || false;
        console.log(this._isView)
        var inp = document.getElementsByTagName('input');
        var havePassword = false;
        for (var i = 0; i < inp.length; i++) {
            var input = inp[i];
            if (this._isView && input.type == 'password') {
                input.setAttribute("Salasana", "true");
                input.type = 'text';
            }
            if (input.getAttribute("Salasana") == "true" && !this._isView) {
                input.type = 'password';
                input.removeAttribute("Salasana");
            }
            if (input.type == 'password' || input.getAttribute("Salasana") == "true") {
                havePassword = true;
                if (atStart) {
                    var generated = this.generatePassword();
                    input.value = generated;
                }
            }
        }
        return havePassword;
    }

    async init() {
        var havePassword = (await this.reset());
        var debug = (await this.getAt('debug')) || false;
        console.log(havePassword);
        if (havePassword) {
            var div = document.createElement('div');
            div.style = `
                position: absolute;
                bottom: 0;
                left: 0;
                width: 10%;
                background-color: #000000;
                color: #ffffff;
                padding: 10px;
                text-align: center;
                z-index: 9999`;
            if (debug) {
                div.appendChild((() => {
                    var p = document.createElement('p');
                    p.innerHTML = "Salasana: " + this._passwords + "<br> Seed: " + this._seed;
                    return p;
                })());
            }
            div.appendChild((() => {
                var b = document.createElement('button');
                b.innerHTML = "debug";
                b.onclick = async () => {
                    this._debug = !this._debug;
                    await this.saveAt('debug', this._debug);
                    document.body.removeChild(div);
                    await this.init();
                }
                return b;
            })());
            div.appendChild((() => {
                var b = document.createElement('button');
                b.innerHTML = "View passwords";
                b.onclick = async () => {
                    this._isView = !this._isView;
                    await this.saveAt('isView', this._isView);
                    await this.reset();
                }
                return b;
            })());
            document.body.prepend(div);
        }
    }

    generatePassword() {
        const cyrb53 = (str, seed = 0) => {
            /*
                cyrb53 (c) 2018 bryc (github.com/bryc)
                A fast and simple hash function with decent collision resistance.
                Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
                Public domain. Attribution appreciated.
            */
            let h1 = 0xdeadbeef ^ seed,
                h2 = 0x41c6ce57 ^ seed;
            for (let i = 0, ch; i < str.length; i++) {
                ch = str.charCodeAt(i);
                h1 = Math.imul(h1 ^ ch, 2654435761);
                h2 = Math.imul(h2 ^ ch, 1597334677);
            }

            h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
            h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

            return 4294967296 * (2097151 & h2) + (h1 >>> 0);
        };
        const length = 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*_:;?,.+-";
        const seed = parseInt(this._seed, 36);
        var hashed = cyrb53(this._passwords, seed);
        var toHash = hashed;
        var password = "";
        for (var i = 0; i < length; i++) {
            password += charset[toHash % charset.length];
            toHash = Math.floor(toHash / charset.length);
            if (toHash < charset.length) {
                hashed = cyrb53((toHash + hashed).toString(36), seed);
                toHash = hashed;
            }
        }
        return password;
    }

    async saveAt(name, value) {
        await browser.storage.local.set({ [name]: value });
    }

    async getAt(name) {
        return (await browser.storage.local.get(name))[name];
    }

    removeAt(name) {
        browser.storage.local.remove(name);
    }
}()