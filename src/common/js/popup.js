/*	Variables globales
************************************************/

domain = "https://game.mastersnakou.fr";
apidomain = "https://wapi.wizebot.tv/api/mastersnakou";
twitch = "https://api.twitch.tv/helix/users?login=";
live = 0;

var img = null;
var snap = false;
var ts = false;

$.ajaxSetup({
    cache: false
});

/*	Fonctions
************************************************/

/**
 * Caclcule l'uptime de la session en cours
 * @param {string} streamDate timestamp correspondant au début du live
 * @param {string} text texte précédent l'affichage de l'uptime
 */
function uptime(streamDate, text = "Uptime : ") {
    var d = new Date(streamDate);
    var t = new Date();
    var uptime = t - d;

    var h = Math.trunc(uptime / 3600000);
    var min = Math.trunc(Math.trunc(uptime - (3600000 * h)) / 60000);
    min = (min < 10) ? '0' + min : min;

    var res = text + h + "h" + min;

    return res;
}

/**
 * Affiche ou non le snap code
 */
function toggleSnap() {
    if (snap) {
        /*on affiche le texte*/
        $('#live').html(SnapText).show();
        /*On affiche le snapcode*/
        $('#brand-logo-channel').attr("src", SnapCodeUrl);
    } else {
        /*On affiche le logo de l'extension*/
        $('#brand-logo-channel').attr("src", img);
        /*on affiche un autre message*/
        $('#live').html("").show();
    }
}

/*	Programme principal
*************************************************/

//On attend le chargement de la poup
$(document).ready(function () {

    chrome.storage.local.get(['baseurl', 'living', 'game', 'time', 'viewers', 'title', 'lastGameChange'], function (result) {
        /*On récupère les informations sur le statut du live*/
        live = setBool(result.living, 0);

        result.baseurl = setUrlRedirect(result.baseurl);

        $("#channel_link").attr("href", result.baseurl + channel.toLowerCase());
        $("#game_link").attr("href", result.baseurl + channel.toLowerCase());

        /*Si le live est lancé*/
        if (live) {
            if (result.lastGameChange != null) {
                $("#game_uptime").text(uptime(result.lastGameChange, "Depuis : "));
            }

            /*On ajoute l'image du jeu*/
            $('#game-logo').attr("src", "https://static-cdn.jtvnw.net/ttv-boxart/" + (result.game).replace(/ /g, "%20") + "-96x144.jpg");
            $('#game-logo').attr("alt", result.game);
            $("#game-logo").attr("title", GameToolTip + result.game);
            $("#game-logo").show();
            /*On modifie l'image de la popup*/
            $('#brand-logo-channel').attr("src", LiveIconUrlPopup);
            /*On change le texte de la popup*/
            $('#viewersCount').html('<span id="live-icon">Live</span>' + result.viewers + ViewersText);
            var uptimeText = uptime(result.time);
            $('#uptime').text(uptimeText);
            $('#title').text(result.title);
        }

        /*Sauvegarde de l'image courante de la popup*/
        img = $('#brand-logo-channel').attr("src");

        $('#live').fadeIn(1000);
    });

    var get_username = function (callback) {
        chrome.storage.local.get(['username', 'userid', 'displayName', 'logo'], function (items) {
            callback(items);
        })
    };

    var show_player = (player) => {
        $('#player-name').text(player['display_name']);
        $('#player-logo').attr("src", player['logo']);
        $('#player-lvl').text('Niv. ' + player['lvl']);
        $('#player').fadeIn(1000);
    };

    var show_points = function (donnees) {
        $.getJSON(apidomain + "/" + donnees['userid'] + "/user_infos", function (data) {
            infos = data['infos'];
            $('#player-name').text(donnees['displayName']);
            $('#player-lvl').text("Points : " + (infos['pts_total'] ? infos['pts_total'] : 0));
            $('#player-logo').attr("src", donnees['logo']);
            $('#player').fadeIn(1000);
        })
    };

    get_username(function (tab) {
        if (tab['userid'] != null && tab['userid'] !== "") {
            show_points(tab);
        } else {

            if (tab['username'] != null && tab['username'] !== "") {
                $.getJSON(domain + "/player/" + tab['username'], function (data) {
                    player = data['player'];
                    var url = twitch + tab['username'];

                    var myHeaders = new Headers();
                    myHeaders.append('Client-ID', API_key_twitch);
                    var myInit = {
                        method: 'GET',
                        headers: myHeaders,
                        mode: 'cors',
                        cache: 'default'
                    };

                    fetch(url, myInit)
                        .then(function (response) {
                            response.json().then(function (data) {
                                data = data.data[0];

                                var donnees = [];
                                donnees['userid'] = data.id;
                                donnees['logo'] = data.profile_image_url;
                                donnees['displayName'] = data.display_name;

                                show_points(donnees);
                                chrome.storage.local.set({
                                    'logo': data.profile_image_url,
                                    'displayName': data.display_name,
                                    'userid': data.id
                                }, function () {
                                });
                            });
                        })
                        .catch(function (error) {
                            console.error(error);
                        });
                });
            } else {
                $('#login').fadeIn(0);
            }
        }
    });

});


/*	Détection des évènements "click"
*************************************************/

/*Lors du clic sur le logo "snapchat"*/
$(document).on('click', '#snapchat', function () {
    //Variables de statut
    snap = !snap;
    ts = false;

    toggleSnap();
});

/*Lors du clic sur le logo "teamspeak"*/
$(document).on('click', '#ts', function () {
    ts = !ts;
    snap = false

    toggleSnap();

    $('#live').html(ts ? TsText : "").show();
});

/*Lors du clic sur les liens, on utilise les onglets intelligemment*/
$(document).on('click', '.redirect', function (event) {
    event.preventDefault();
    manageTabs($(this));
});

