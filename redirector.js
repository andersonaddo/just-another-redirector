const BUTTON_ID = "just-another-director-element"

async function main() {

    const config = getPropertiesFromUrl();
    if (!config) return

    const parentHolder = document.createElement("div");
    parentHolder.id = BUTTON_ID
    parentHolder.style.height = "30px"
    parentHolder.style.width = "70px"
    parentHolder.style.display = "flex"
    parentHolder.style.alignItems = "center"
    parentHolder.style.justifyContent = "center"
    parentHolder.style.zIndex = 2
    parentHolder.style.borderRadius = "6px"
    parentHolder.style.cursor = "pointer"
    parentHolder.style.backgroundColor = config.color
    parentHolder.addEventListener('click', config.replaceFunc);

    const text = document.createElement("p")
    text.style.margin = "0 0 0 0"
    text.style.userSelect = "none"
    text.innerText = config.text
    text.style.color = config.textColor
    parentHolder.appendChild(text)

    //Async just in case we need to do some waiting (like maybe the element we need only appears after some js loads it in
    const chosenAnchorInPage = (await config.buttonParentGetter())
    if (!chosenAnchorInPage) {
        logger("nothing found!")
        return //No luck! Sorry; not alternative UI for you....
    }

    //Placing the button, but for many websites the headers (or wherever this button is placed)
    //are dynamic, often changing and removing and re-adding all their children, so we should
    //listen for child changes and act accordingly
    config.modifier(chosenAnchorInPage, parentHolder)
    listenForChildNumberChanges(chosenAnchorInPage, function () {
        if (!chosenAnchorInPage.querySelector("#" + BUTTON_ID)) {
            config.modifier(chosenAnchorInPage, parentHolder)
        }
    });
}



function getPropertiesFromUrl() {
    const host = window.location.hostname

    if (host.endsWith("twitter.com")) {
        return {
            color: "skyblue",
            textColor: "white",
            text: "Nitter",
            replaceFunc: nitterReplacer,
            buttonParentGetter: twitterButtonParentFinder,
            modifier: twitterButtonParentModifier
        }
    }

    if (host.endsWith("reddit.com")) {
        return {
            color: "grey",
            textColor: "black",
            text: "Teddit",
            replaceFunc: tedditReplacer,
            buttonParentGetter: redditButtonParentFinder,
            modifier: redditButtonParentModifier
        }
    }

    if (host.endsWith("youtube.com")) {
        return {
            color: "darkred",
            textColor: "white",
            text: "Piped",
            replaceFunc: pipedReplacer,
            buttonParentGetter: youtubeButtonParentFinder,
            modifier: (parent, child) => parent.appendChild(child)
        }
    }

    //Not really sure what to do about instagram, maybe 
    //dumpor, but it has its own problems and doesn't even seem to work 
    //for all profiles 
}


//********************************* 
//String replacer functions
//********************************* 

function nitterReplacer() {
    const url = new URL(window.location.href)
    url.hostname = "nitter.net"
    window.location.replace(url.toString());
}

function tedditReplacer() {
    const url = new URL(window.location.href)
    url.hostname = "teddit.net"
    window.location.replace(url.toString());
}

function pipedReplacer() {
    const url = new URL(window.location.href)
    url.hostname = "piped.video"
    window.location.replace(url.toString());
}


//********************************* 
//Button Parent Finders
//********************************* 

async function youtubeButtonParentFinder() {
    let chosenParent = null;
    if (!isMobileUserAgent()) {
        chosenParent = document.getElementById("buttons");
    } else {
        chosenParent = document.getElementsByClassName("mobile-topbar-header-content non-search-mode").item(0)
    }
    return chosenParent
}

async function twitterButtonParentFinder() {
    if (!isMobileUserAgent()) {
        await sleep(2000)
        const candidates = document.querySelectorAll('[role="navigation"]');
        return candidates.item(0)
    } else {
        const candidates = document.querySelectorAll('[data-testid="twitter-logged-out-nav"]')
        return candidates.item(0)?.lastChild?.firstChild?.firstChild
    }
}

function redditButtonParentFinder() {
    if (!isMobileUserAgent()) {
        const candidates = document.querySelectorAll('[role="navigation"]');
        return candidates.length > 0 ? candidates[0].parentNode?.parentNode : null
    } else {
        const app = document.getElementsByTagName("shreddit-app").item(0)
        //From here we have to start querying shadow nodes, but those don't have 
        //getElementsByTagName or querySelectorAll, and in this webpage thier first children
        //are comments. So we'll have to iterate over it's children
        const appChildren = app?.shadowRoot?.childNodes
        if (!appChildren) return

        let header = undefined
        for (const child of appChildren) {
            if (child.nodeName.toLowerCase() == "reddit-header") {
                header = child
                break
            }
        }

        const headerChildren = header?.shadowRoot?.childNodes
        if (!headerChildren) return

        for (const child of headerChildren) {
            if (child.nodeName.toLowerCase() == "header") {
                header = child
                break
            }
        }

        return header?.getElementsByTagName("div").item(0)?.getElementsByTagName("div").item(0)
    }

}



//********************************* 
//Button Parent Modifiers
//********************************* 

function redditButtonParentModifier(parent, child) {
    if (!isMobileUserAgent()) {
        parent.appendChild(child)
    } else {
        parent.prepend(child)
    }
}

function twitterButtonParentModifier(parent, child) {
    if (!isMobileUserAgent()) {
        parent.prepend(child)
    } else {
        parent.appendChild(child)
    }
}


main().catch(e => console.error(e))