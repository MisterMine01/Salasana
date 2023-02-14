(async () => {
    var key = (await browser.storage.local.get("key"))["key"] || "";
    if (key == "") {
        browser.tabs.create({ url: browser.runtime.getURL("pages/at_start.html") })
    }
})();