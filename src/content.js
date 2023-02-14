var Salasana = new class {
    constructor() {
        var url = window.top.location.href
        this._seed = url.split('/')[2];
        console.log(this._seed);
        this.init();
    }

    async reset() {
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
                var generated = this.generatePassword();
                input.value = generated;
                havePassword = true;
            }
        }
        return havePassword;
    }

    async init() {
        var havePassword = (await this.reset());
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
            var p = document.createElement('p');
            p.innerHTML = "Salasana: " + this._passwords + "<br> Seed: " + this._seed;
            div.appendChild(p);
            var b = document.createElement('button');
            b.innerHTML = "View passwords";
            b.onclick = async () => {
                this._isView = !this._isView;
                await this.saveAt('isView', this._isView);
                await this.reset();
            }
            div.appendChild(b);
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
        return cyrb53(this._passwords, this._seed).toString(36);
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