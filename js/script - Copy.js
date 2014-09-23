$(document).ready(function() {
    var feedReader = {
        globals: {
            liColor: ["db552d", "009a00", "00b1f0", "a700a0", "e12c2d", "fbd10a", "613cbc", "ed7200", "be1e4a"],
            feedColors: {},
            i: 0,
            url: null,
            li: null,
            liName: null,
            liSelect: null,
            feedName: null,
            window_width: null,
            window_height: null,
            feedArray: {},
            liFlags: [],
            k: 0,
            keys: null,
            preDefined: {
                BGR: "http://feeds.feedburner.com/bgr/maKT?format=xml",
                Verge: "http://www.theverge.com/rss/frontpage",
                Engadget: "http://www.engadget.com/rss.xml",
                Techcrunch: "http://techcrunch.com/feed/",
                IBNLive: "http://ibnlive.in.com/ibnrss/top.xml",
                Hindu: "http://www.thehindu.com/?service=rss",
                Dailymail: "http://www.dailymail.co.uk/home/index.rss",
                MirrorUK: "http://feeds.feedburner.com/co/XPzh?fmt=xml",
                Wired: "http://feeds.feedburner.com/wired/kEuz",
                Ninegag: "http://9gagrss.com/feed/",
                WPCentral: "http://www.mobilenations.com/rss/mb.xml",
                Mashable: "http://feeds.feedburner.com/mashable/jbgc",
                India: "http://www.india.com/feed/",
                Lifehacker: "http://www.lifehacker.co.in/rss_section_feeds/2147477990.cms",
                Microsoft: "http://microsoft-news.com/feed/",
                Pocketnow: "http://feeds.feedburner.com/pocketnow",
                Wsj: "http://online.wsj.com/xml/rss/3_7085.xml",
                SSMusic: "http://ssmusictheblog.blogspot.in/feeds/posts/default"
            }
        },
        doms: {
            addURL: $("#addURL"),
            closeSetting: $("#close"),
            activateModal: $(".activate_modal"),
            documentBody: $("body"),
            navLi: "li.navLi",
            readMore: ".read_More",
            closeFrameButton: "#closeFrame",
            fbButton: ".fbShare",
            twitterButton: ".twitter",
            saveButton: ".save",
            removeTopic: ".topicRemove",
            removeSave: ".closeHeading"
        },
        events: {
            'addFeed': function(event) {
                if ($("#url").val().length > 7 && $("input#predef").val() == "Select the Topic") {
                    feedReader.globals.url = $("#url").val();
                    feedReader.globals.feedName = $("#name").val();
                } else {
                    feedReader.globals.feedName = $("input#predef").val();
                    feedReader.globals.url = feedReader.globals.preDefined[$("input#predef").val()];
                }
                feedReader.getNewFeed();
            },
            'closeSetting': function() {
                $("#url").val("http://");
                $("#name").val("");
                $("input#predef").val("Select the Topic");
                feedReader.close_Modal();
            },
            'activate_Modal': function() {
                feedReader.getReady();
                var modal_id = $(this).attr('name');
                feedReader.show_Modal(modal_id);
            },
            'assignColor': function() {

                if ($(this).index() != $("li.navLi").length) {
                    if (feedReader.globals.liFlags[$(this).text()] == false) {



                        feedReader.displayFeed($(this).text());
                        feedReader.globals.liSelect = "#" + feedReader.globals.feedColors[$(this).text()];
                        $(this).css({
                            backgroundColor: feedReader.globals.liSelect,
                            color: "white"
                        });
                        feedReader.globals.liFlags[$(this).text()] = true;



                    } else {



                        $("#newsFeed").children().remove();
                        $(this).css({
                            backgroundColor: "white",
                            color: "#868788"
                        });
                        feedReader.globals.liFlags[$(this).text()] = false;



                    }
                }
            },
            'openFrame': function() {
                var frame;
                event.preventDefault();
                feedReader.getReady();
                frame = document.createElement("iframe");
                frame.src = $(this).attr('href');
                frame.style.width = window_width - 50 + "px";
                frame.style.height = window_height - 100 + "px";
                document.body.appendChild(frame);
                $("#closeFrame").css("display", "inline-block");
            },
            'closeFrame': function() {
                $("iframe").remove();
                $("#closeFrame").css("display", "none");
            },
            'facebookShare': function() {
                var fbshare;
                fbshare = $(this).prev().attr('href');
                t = "GeeksBook";
                window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(fbshare) + '&t=' + encodeURIComponent(t), 'sharer', 'toolbar=0,status=0,width=626,height=436');
            },
            'twitterShare': function() {
                var twitterURL;
                twitterURL = $(this).prev().prev().prev().attr('href');
                t = "GeeksBook";
                window.open('https://twitter.com/intent/tweet?source=tweetbutton&text=' + t + '&url=' + encodeURIComponent(twitterURL), 'Twitter', 'toolbar=0,status=0,width=626,height=436');
            },
            'saveNews': function() {
                var heading,
                    a,
                    aClose;
                a = $(this).prev().prev().clone();
                $(a).text("Read Now");
                aClose = document.createElement("a");
                $(aClose).attr({
                    href: 'javascript:void(0)',
                    class: 'closeHeading'
                });;
                heading = $(this).parent().prev().prev().clone();
                $(heading).append(a);
                $(heading).append(aClose);
                $("#saveRecent").append(heading);
            },
            'removeFeedTopic': function() {
                var removeText = $(this).parent().text();
                that = $(this);
                feedReader.globals.keys = Object.keys(feedReader.globals.feedArray);
                $(feedReader.doms.navLi).each(function() {
                    if ($(this).text() == removeText) {
                        delete feedReader.globals.feedArray[removeText];
                        $(this).remove();
                        that.parent().remove();
                    }
                });
            },
            'removeSaveHeading': function() {
                $(this).parent().remove();
            }
        },
        'getNewFeed': function() {
            var name,
                newname;
            $.ajax({
                url: "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&output=json&q=" + encodeURIComponent(feedReader.globals.url) + "&hl=en&callback=?",
                dataType: "json",
                success: function(data) {
                    newname = feedReader.globals.feedName;
                    feedReader.globals.feedArray[newname] = new Array();
                    feedReader.globals.feedArray[newname] = data.responseData.feed.entries;
                    li = document.createElement("li");
                    $(li).addClass('navLi');
                    li.innerHTML = feedReader.globals.feedName;
                    $(li).insertAfter('#search');
                    feedReader.globals.feedColors[newname] = feedReader.globals.liColor[feedReader.globals.k];
                    feedReader.globals.k++;
                    feedReader.globals.liFlags.push(newname);
                    feedReader.globals.liFlags[newname] = false;
                    feedReader.createOption();
                    feedReader.globals.keys = Object.keys(feedReader.globals.feedArray);
                },
            });
        },
        'createOption': function() {
            var span,
                a,
                color;
            feedReader.globals.keys = Object.keys(feedReader.globals.feedArray);
            $('.topicSpan').remove();
            for (i = 0; i < feedReader.globals.keys.length; i++) {
                color = "#" + feedReader.globals.feedColors[feedReader.globals.keys[i]];
                span = document.createElement("span");
                $(span).addClass('topicSpan');
                a = document.createElement("a");
                $(a).addClass('topicRemove');
                $(a).attr('href', 'javascript:void(0)');
                $(span).css("backgroundColor", color);
                span.innerHTML = feedReader.globals.keys[i];
                span.appendChild(a);
                $(span).insertBefore('.buttonControls');
            }
        },
        'displayFeed': function(feed) {
            var cnt,
                article = document.getElementById("newsFeed"),
                title,
                content,
                contentTime,
                link,
                dt,
                fbShare,
                save,
                twitter,
                div,
                feedTitle;
            feedReader.globals.keys = Object.keys(feedReader.globals.feedArray);
            for (var j = 0; j < feedReader.globals.keys.length; j++) {
                if (feed == feedReader.globals.keys[j]) {
                    title = feedReader.globals.keys[j];
                    $("#newsFeed").children().remove();
                    for (var k = 0; k < feedReader.globals.feedArray[feedReader.globals.keys[j]].length; k++) {
                        cnt = document.createElement("section");
                        article.appendChild(cnt);
                        feedTitle = document.createElement("h1");
                        feedTitle.innerHTML = feedReader.globals.feedArray[feedReader.globals.keys[j]][k].title;
                        cnt.appendChild(feedTitle);
                        dt = new Date(feedReader.globals.feedArray[feedReader.globals.keys[j]][k].publishedDate);
                        contentTime = document.createElement("h2");
                        contentTime.innerHTML = dt.toLocaleDateString();
                        feedTitle.appendChild(contentTime);
                        content = document.createElement("p");
                        content.innerHTML = feedReader.globals.feedArray[feedReader.globals.keys[j]][k].content;
                        $(content).find("iframe").remove();
                        $(content).find("br").remove();
                        cnt.appendChild(content);
                        div = document.createElement("div");
                        link = document.createElement("a")
                        $(link).addClass('read_More');
                        link.href = feedReader.globals.feedArray[feedReader.globals.keys[j]][k].link;
                        link.innerHTML = "Read More";
                        div.appendChild(link);
                        fbShare = document.createElement("a"),
                        save = document.createElement("a");
                        twitter = document.createElement("a");
                        $(fbShare).attr("class", 'fbShare');
                        $(fbShare).attr("href", 'javascript:void(0)');
                        div.appendChild(fbShare);
                        $(save).attr("class", 'save');
                        $(save).attr("href", 'javascript:void(0)');
                        div.appendChild(save);
                        $(twitter).attr("class", 'twitter');
                        $(twitter).attr("href", 'javascript:void(0)');
                        div.appendChild(twitter);
                        cnt.appendChild(div);
                    }
                }
            }
        },
        'getReady': function() {
            window_width = $(window).width();
            window_height = $(window).height();
            $('.modal_window').each(function() {
                var modal_height = $(this).outerHeight();
                var modal_width = $(this).outerWidth();
                var top = (window_height - modal_height) / 2 - 50;
                var left = (window_width - modal_width) / 2;
                $(this).css({
                    'top': top,
                    'left': left
                });
            });
        },
        'close_Modal': function() {
            $('#mask').fadeOut(200);
            $('.modal_window').fadeOut(200);
        },
        'show_Modal': function(modal_id) {
            $('#mask').css({
                'display': 'block',
                opacity: 0
            });
            $('#mask').fadeTo(200, 0.8);
            $('#' + modal_id).fadeIn(200);
        },
        'autoExecute': function() {
            var urlKeys;
            $("#url").val("http://");
            $("#name").val("");
            $("#nav").slideDown("slow", function() {});
            $("#saveRecent").slideDown("slow", function() {});

            for (urlKeys in feedReader.globals.preDefined) {
                $("#predefinedURL").append("<option value=" + urlKeys + ">");
            }
            $("input#predef").val("Select the Topic");
        }
    }
    feedReader.autoExecute();
    feedReader.doms.documentBody.on("click", feedReader.doms.navLi, feedReader.events.assignColor);
    feedReader.doms.documentBody.on("click", feedReader.doms.readMore, feedReader.events.openFrame);
    feedReader.doms.documentBody.on("click", feedReader.doms.fbButton, feedReader.events.facebookShare);
    feedReader.doms.documentBody.on("click", feedReader.doms.twitterButton, feedReader.events.twitterShare);
    feedReader.doms.documentBody.on("click", feedReader.doms.saveButton, feedReader.events.saveNews);
    feedReader.doms.documentBody.on("click", feedReader.doms.closeFrameButton, feedReader.events.closeFrame);
    feedReader.doms.documentBody.on("click", feedReader.doms.removeTopic, feedReader.events.removeFeedTopic);
    feedReader.doms.documentBody.on("click", feedReader.doms.removeSave, feedReader.events.removeSaveHeading);
    feedReader.doms.addURL.click(feedReader.events.addFeed);
    feedReader.doms.closeSetting.click(feedReader.events.closeSetting);
    feedReader.doms.activateModal.click(feedReader.events.activate_Modal);
});