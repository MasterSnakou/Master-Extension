var username = $("#username").html();

if (username != []) {
    chrome.runtime.sendMessage({username: username}, function (response) {
        window.location.replace("https://mastersnakou.wize.bot/");
    });
} else {
    chrome.runtime.sendMessage({username: null}, function (response) {
        window.location.replace("https://game.mastersnakou.fr/login");
    });
}
