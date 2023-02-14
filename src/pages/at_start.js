
var Salana_demand = document.getElementById("Salana_demand_form");
var Salana_demand_error = document.getElementById("Salana_demand_error");
Salana_demand.addEventListener("submit", function (e) {
    e.preventDefault();
    var password = Salana_demand.password.value;
    var password2 = Salana_demand.password2.value;
    if (password == password2) {
        Salana_demand_error.innerHTML = "";
        browser.storage.local.set({ key: password })
            .then(() => {
                browser.storage.local.get("key")
                    .then((res) => {
                        console.log(res);
                    });
                //window.close();
            });
    } else {
        Salana_demand_error.innerHTML = "passwords don't match";
    }
});