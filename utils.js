function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


//For testing, you can use this user agent:
//Mozilla/5.0 (Android 13; Mobile; rv:68.0) Gecko/68.0 Firefox/106.0
//Courtesy of https://www.whatismybrowser.com/guides/the-latest-user-agent/firefox
function isMobileUserAgent() {
    const agent = window.navigator.userAgent;
    return agent.includes("Android"); //Currently not designed to handle iOS anyways
}


function logger(...args) {
    console.log("JUST ANOTHER REDIRECT: ", ...args)
}

//https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
function listenForChildNumberChanges(elem, callback) {
    const config = { attributes: true, childList: true, subtree: false };

    // Callback function to execute when mutations are observed
    const observerCallback = (mutationList) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                callback()
                break;
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(observerCallback);

    // Start observing the target node for configured mutations
    observer.observe(elem, config);
}
