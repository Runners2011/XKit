//* TITLE User Menus+ **//
//* VERSION 2.5 REV B **//
//* DESCRIPTION More options on the user menu **//
//* DEVELOPER STUDIOXENIX **//
//* DETAILS This extension adds additional options to the user menu (the one that appears under user avatars on your dashboard), such as Avatar Magnifier, links to their Liked Posts page if they have them enabled. Note that this extension, especially the Show Likes and Show Submit options use a lot of network and might slow your computer down. **//
//* FRAME false **//
//* BETA false **//
//* SLOW true **//

XKit.extensions.show_more = new Object({

	running: false,
	slow: true,

	likes_available: new Object(),
	submit_available: new Object(),
	anon_available: new Object(),

	preferences: {
		"sep0": {
			text: "XKit Classic User Menu",
			type: "separator",
		},
		"use_classic_menu": {
			text: "Enable XKit's Classic User Menu",
			default: false,
			value: false,
			experimental: true
		},
		"sep1": {
			text: "User Menu Options",
			type: "separator",
		},
		"show_magnetizer": {
			text: "Show Magnifier button to see a bigger version of their avatars",
			default: true,
			value: true
		},
		"show_archive": {
			text: "Show a link to the user's archive",
			default: false,
			value: false
		},
		"show_likes": {
			text: "Show Likes button if user is sharing their liked posts",
			default: true,
			value: true
		},
		"show_submits": {
			text: "Show Submit button if user has their submit box enabled",
			default: false,
			value: false
		},
		"sep2": {
			text: "In-Dashboard Asks",
			type: "separator",
		},
		"enable_anon": {
			text: "Enable sending anonymous messages from the dashboard",
			default: true,
			value: true
		}
	},

	init_inbox_asks: function() {

		var askbox_template = XKit.storage.get("show_more","inbox_ask_template","");
		if (askbox_template !== "") {
			// console.log("Found Inbox Ask Template!");
		} else {
			// console.log("Template not found, quitting init_inbox_asks.");
			return;
		}

		$("body").append(askbox_template);

		return;

		if ($("body").hasClass("dashboard_messages_inbox") === true || $("body").hasClass("dashboard_messages_submissions") === true) {
			$.getScript("https://assets.tumblr.com/assets/scripts/dashboard_ask.js?_v=" + XKit.tools.random_string(), function(data, textStatus, jqxhr) {
   				// console.log('Load of dashboard_ask.js complete.');

   				XKit.tools.add_function(function() {
   					Tumblr.DashboardAsk.initialize();
   				}, true, "");
			});
		}

	},

	run: function() {

		this.running = true;
		XKit.tools.init_css("show_more");
		XKit.post_listener.add("show_more", XKit.extensions.show_more.do_posts);
		XKit.extensions.show_more.do_posts();

		if (document.location.href.indexOf('www.tumblr.com/follow/') != -1)
			return;

		if (XKit.interface.where().inbox === true) {
			XKit.extensions.show_more.init_inbox_asks();
		} else {
			if ($("#dashboard_ask_template").length > 0) {
				XKit.storage.set("show_more","inbox_ask_template", $("#dashboard_ask_template")[0].outerHTML);
			}
		}

		/*if (this.preferences.hide_previews.value === true) {

			XKit.tools.add_css(".popover .recent_posts { display: none; } .popover .tumblelog_info { border-radius: 6px; border-top: 0px; }", "show_more_hide_previews");

		}

		if (this.preferences.hide_follow.value === true) {

			XKit.tools.add_css(".popover .follow_nav { display: none; }", "show_more_hide_follows");

		}*/

		if (this.preferences.use_classic_menu.value === true) {

			XKit.tools.add_css(".tumblelog_popover_v1, .tumblelog_popover_v2, .tumblelog_popover { display: none !important; }", "show_more_classic_menu");
			$(document).on('mouseover', '.post_avatar_link', XKit.extensions.show_more.enable_classic_menu);

			$(document).scroll(function() {

				if ($(".xkit-classic-menu-opener.opened").length > 0) {

					var m_parent = XKit.extensions.show_more.classic_popup_last_object;
					var m_top = $(m_parent).find(".xkit-classic-menu-opener").offset().top + 30;

					if ($("#xkit-classic-user-menu").css("top") !== m_top + "px") {
						$("#xkit-classic-user-menu").css("top", m_top + "px");
					}

				}

			});

		}

		$(document).on('mouseover', 'a', XKit.extensions.show_more.store_data_username_if_userlink);
		$(document).on('mouseover', '.post_info_fence a, .post_info a, a.username', XKit.extensions.show_more.store_data_username);
		$(document).on('mouseover', '.post_avatar_link', XKit.extensions.show_more.store_data_avatar);
		$(document).on('click mouseover','.tumblelog_popover .info_popover_button', XKit.extensions.show_more.add_links_new);

	},

	popup_data: "",
	popup_data_req_id: 0,
	classic_popup_last_object: "",

	hide_classic_menu: function() {

		$("#xkit-classic-user-menu-glass").remove();
		$(".xkit-classic-menu-opener").removeClass("opened");
		$("#xkit-classic-user-menu").fadeOut('fast', function() { $(this).remove() });

	},

	show_classic_menu: function(e) {

		e.preventDefault();
		e.stopPropagation();

		var m_obj = $(e.target);

		// console.log(XKit.extensions.show_more.popup_data);

		if (typeof XKit.extensions.show_more.popup_data.avatar_url === "undefined") {
			return;
		}

                var avatar_url = XKit.extensions.show_more.popup_data.avatar_url;
                var user_url = XKit.extensions.show_more.popup_data.name;

		var m_parent = $(m_obj).parentsUntil('.post').parent();
		XKit.extensions.show_more.classic_popup_last_object = m_parent;

		$("#xkit-classic-user-menu").remove();
		$("#xkit-classic-user-menu-glass").remove();

		var m_html = "<div id=\"xkit-classic-user-menu\">";

		m_html = m_html + "<a class=\"xkit-open\" target=\"_blank\" href=\"" + XKit.extensions.show_more.popup_data.url + "\">Open in New Tab</a>";

		if (XKit.extensions.show_more.popup_data.show_ask == 1 ||XKit.extensions.show_more.popup_data.asks == 1) {
			var anon_status = "0";
			if (XKit.extensions.show_more.popup_data.ask_allows_anonymous === true || XKit.extensions.show_more.popup_data.anonymous_asks === true ||XKit.extensions.show_more.popup_data.ask_allows_anonymous === 1 || XKit.extensions.show_more.popup_data.anonymous_asks === 1) {
				anon_status = "1";
			}
			if (user_url === "xkit-extension") {
				m_html = m_html + "<a href=\"https://" + user_url + ".tumblr.com/ask\" target=\"_BLANK\" class=\"xkit-ask\">XKit Support</a>";
			} else {
				m_html = m_html + "<a href=\"https://" + user_url + ".tumblr.com/ask\" data-anonymous-ask=\"" + anon_status + "\" data-tumblelog-name=\"" + user_url + "\" class=\"xkit-ask ask\">Ask</a>";
			}
		}

		if (XKit.extensions.show_more.popup_data.following == true || XKit.extensions.show_more.popup_data.is_following == true) {
			m_html = m_html + "<a target=\"_blank\" href=\"/send/" + user_url + "\" data-tumblelog-name=\"" + user_url + "\" class=\"xkit-fan-mail fan_mail\">Fan Mail</a>";
		}

		if (XKit.extensions.show_more.popup_data.following == true || XKit.extensions.show_more.popup_data.is_following == true) {
			m_html = m_html + "<a data-tumblelog-name=\"" + user_url + "\" class=\"xkit-unfollow xkit-unfollow-" + user_url + "\">Unfollow</a>";
		} else {
			m_html = m_html + "<a data-tumblelog-name=\"" + user_url + "\" class=\"xkit-follow xkit-follow-" + user_url + "\">Follow</a>";
		}

                if (XKit.extensions.show_more.preferences.show_magnetizer.value === true) {

                	if (avatar_url !== "" && typeof avatar_url !== "undefined") {
                		m_html = m_html + "<div data-avatar-url=\"" + avatar_url + "\" class=\"xkit-magnetizer xkit-show-more-item xkit-avatar-magnetizer-new xkit-avatar-magnetizer-button-" + user_url + "\" data-user-url=\"" + user_url + "\">" +
                					"Avatar Magnifier" +
                				  "</div>";
                	}

		}

                if (XKit.extensions.show_more.preferences.show_archive.value === true) {

                	m_html = m_html + "<a target=\"_blank\" href=\"http://" + user_url + ".tumblr.com/archive\" class=\"xkit-archive archive\">Archive</a>";

		}

                if (XKit.extensions.show_more.preferences.show_submits.value === true && XKit.extensions.show_more.submit_available[user_url] === true) {

                	var m_likes_url = "http://" + user_url + ".tumblr.com/submit";

                	m_html = m_html + "<a target=\"_blank\" href=\"" + m_likes_url + "\" class=\"xkit-submit\">Submit</a>";

                }

                if (XKit.extensions.show_more.preferences.show_likes.value === true && XKit.extensions.show_more.likes_available[user_url] === true) {

                	var m_likes_url = "https://www.tumblr.com/liked/by/" + user_url;

                	m_html = m_html + "<a target=\"_blank\" href=\"" + m_likes_url + "\" class=\"xkit-likes\">Likes</a>";

                }

                //// console.log("EH? " + XKit.extensions.show_more.custom_menu_extension);
                if (XKit.extensions.show_more.custom_menu_extension.length >= 0) {

                	var m_data = XKit.extensions.show_more.popup_data;

                	for (var i=0;i<XKit.extensions.show_more.custom_menu_extension.length;i++) {

                		var returned_menu = "";

                		try {
                			returned_menu = XKit.extensions.show_more.custom_menu_function[i](m_data);
                		} catch(e) {
                			returned_menu = "";
                		}

                		m_html = m_html + returned_menu;
                	}

                }

		m_html = m_html + "</div><div id=\"xkit-classic-user-menu-glass\">&nbsp;</div>";

		$("body").append(m_html);

		$(".xkit-classic-menu-opener").removeClass("opened");
		$(m_parent).find(".xkit-classic-menu-opener").addClass("opened");

		var m_top = $(m_parent).find(".xkit-classic-menu-opener").offset().top + 30;
		var m_left = $(m_parent).find(".xkit-classic-menu-opener").offset().left - 20;

		$("#xkit-classic-user-menu").css("top", m_top + "px");
		$("#xkit-classic-user-menu").css("left", m_left + "px");


			// console.log("Attaching bindings...");

		setTimeout(function() {

			$("#xkit-classic-user-menu .xkit-unfollow-" + user_url).unbind('click');
			$("#xkit-classic-user-menu .xkit-unfollow-" + user_url).bind('click', function(e) {
				e.preventDefault();
				XKit.extensions.show_more.hide_classic_menu();
				XKit.extensions.show_more.unfollow_person($(this).attr('data-tumblelog-name'), m_parent);
				$(".tumblelog_popover_glass").trigger('click');
				setTimeout(function() { $(".tumblelog_popover_glass").trigger('click'); }, 10);
				$(".popover").hide();
			});

			$("#xkit-classic-user-menu .xkit-follow-" + user_url).unbind('click');
			$("#xkit-classic-user-menu .xkit-follow-" + user_url).bind('click', function(e) {
				try {
					e.preventDefault();
					XKit.extensions.show_more.hide_classic_menu();
					XKit.extensions.show_more.follow_person($(this).attr('data-tumblelog-name'), m_parent);
					$(".tumblelog_popover_glass").trigger('click');
					setTimeout(function() { $(".tumblelog_popover_glass").trigger('click'); }, 10);
					$(".popover").hide();
				} catch(e) {
					alert(e.message);
				}
			});

		}, 300);


			$("#xkit-classic-user-menu-glass").unbind("click");
			$("#xkit-classic-user-menu-glass").bind("click", function() {
				XKit.extensions.show_more.hide_classic_menu();
			});

			$("#xkit-classic-user-menu a, #xkit-classic-user-menu div").unbind("click");
			$("#xkit-classic-user-menu a, #xkit-classic-user-menu div").bind("click", function() {
				XKit.extensions.show_more.hide_classic_menu();
			});

			$("#xkit-classic-user-menu a.xkit-fan-mail").unbind("click");
			$("#xkit-classic-user-menu a.xkit-fan-mail").bind("click", function(e) {
				e.preventDefault();
				XKit.extensions.show_more.hide_classic_menu();
				XKit.tools.add_function(function() {
							var f = {
									href: "/send/" + jQuery(".xkit-fan-mail").attr('data-tumblelog-name')
							};
					Tumblr.FanMail.show(f);
				}, true, "");

			});

			$(".xkit-avatar-magnetizer-button-" + user_url).unbind('click');
			$(".xkit-avatar-magnetizer-button-" + user_url).bind('click', function() {

				XKit.extensions.show_more.hide_classic_menu();
				XKit.extensions.show_more.show_avatar(user_url);
				$(".tumblelog_popover_glass").trigger('click');
				setTimeout(function() { $(".tumblelog_popover_glass").trigger('click'); }, 10);
				$(".popover").hide();
				//$("#glass_overlay").removeClass("show");

			});

	},

	custom_menu_extension: new Array(),
	custom_menu_function: new Array(),
	custom_menu_callback: new Array(),

	follow_person: function(user_url, m_parent) {

		var m_data = "form_key=" + XKit.interface.form_key() + "&data%5Btumblelog%5D=" + user_url + "&data%5Bsource%5D=FOLLOW_SOURCE_IFRAME";
		GM_xmlhttpRequest({
			method: "POST",
			url: "http://www.tumblr.com/svc/follow",
			data: m_data,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			json: false,
			onerror: function(response) {
				alert("Unable to follow/unfollow person, error: SM_FL013\n\nPlease try again later or file a bug report by going to xkit-extension.tumblr.com/ask");
			},
			onload: function(response) {
				XKit.notifications.add("User " + user_url + " followed.");
				if (m_parent) {
					var json_data = $(m_parent).find(".post_avatar_link").attr('data-tumblelog-popover');
					try {
						var json_obj = JSON.parse(json_data);
						json_obj.following = true;
						$(m_parent).find(".post_avatar_link").attr('data-tumblelog-popover', JSON.stringify(json_obj));
					} catch(e) {
						// console.log("Unable to set popover obj data");
					}
				}
			}
		});

	},

	unfollow_person: function(user_url, m_parent) {

		// console.log("Unfollowing " + user_url);
		var m_data = "form_key=" + XKit.interface.form_key() + "&data%5Btumblelog%5D=" + user_url + "&data%5Bsource%5D=FOLLOW_SOURCE_IFRAME";
		GM_xmlhttpRequest({
			method: "POST",
			url: "http://www.tumblr.com/svc/unfollow",
			data: m_data,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			json: false,
			onerror: function(response) {
				alert("Unable to follow/unfollow person, error: SM_FL013\n\nPlease try again later or file a bug report by going to xkit-extension.tumblr.com/ask");
			},
			onload: function(response) {
				XKit.notifications.add("User " + user_url + " unfollowed.");
				if (m_parent) {
					var json_data = $(m_parent).find(".post_avatar_link").attr('data-tumblelog-popover');
					try {
						var json_obj = JSON.parse(json_data);
						json_obj.following = false;
						$(m_parent).find(".post_avatar_link").attr('data-tumblelog-popover', JSON.stringify(json_obj));
					} catch(e) {
						// console.log("Unable to set popover obj data");
					}
				}
			}
		});

	},

	add_custom_menu: function(extension_name, func, callback) {

		var m_index = XKit.extensions.show_more.custom_menu_extension.indexOf(extension_name);
		if (m_index !== -1) { return; }

		XKit.extensions.show_more.custom_menu_extension.push(extension_name);
		XKit.extensions.show_more.custom_menu_function.push(func);
		XKit.extensions.show_more.custom_menu_callback.push(callback);

	},

	remove_custom_menu: function(extension_name) {

		var m_index = XKit.extensions.show_more.custom_menu_extension.indexOf(extension_name);
		if (m_index === -1) { return; }

		XKit.extensions.show_more.custom_menu_extension.splice(m_index,1);
		XKit.extensions.show_more.custom_menu_function.splice(m_index,1);
		XKit.extensions.show_more.custom_menu_callback.splice(m_index,1);

	},

	enable_classic_menu: function(e) {

		var m_obj = $(e.target);

		//// console.log("Trying to add: " + XKit.extensions.show_more.popup_data);

		if (m_obj.hasClass("post_avatar_link") !== true) {
			while (m_obj.hasClass("post_avatar_link") !== true) {
				m_obj = m_obj.parent();
			}
		}

		if (m_obj.find(".xkit-classic-menu-opener").length <= 0) {
			$(m_obj).append("<div class=\"xkit-classic-menu-opener\">&nbsp;</div>");
		}

		$(".xkit-classic-menu-opener").unbind("click", XKit.extensions.show_more.show_classic_menu);
		$(".xkit-classic-menu-opener").bind("click", XKit.extensions.show_more.show_classic_menu);

	},

	store_data_username_if_userlink: function(e) {

		var m_obj = $(e.target);

		if (typeof $(m_obj).attr('href') === "undefined") { return; }

		var m_url = $(m_obj).attr('href').toLowerCase();

		if (m_url.substring(m_url.length - 1) === "/") {m_url = m_url.substring(0, m_url.length - 1); }

		if (m_url.substring(0, 7) === "http://" && m_url.substring(m_url.length - 11) === ".tumblr.com") {
			var m_username = m_url.substring(7, m_url.length - 11);
			XKit.extensions.show_more.store_data_username(e, true, m_username);
		}


	},

	store_data_username: function(e, userlink_mode, real_username) {

		var m_obj = $(e.target);

		XKit.extensions.show_more.popup_data.popup_data_req_id = XKit.tools.random_string() + XKit.tools.random_string();

		XKit.extensions.show_more.popup_data = new Object();

		if (typeof $(m_obj).attr('data-tumblelog-popover') !== "undefined") {

			try {
				XKit.extensions.show_more.popup_data = JSON.parse($(m_obj).attr('data-tumblelog-popover'));
			} catch(e) {
				XKit.extensions.show_more.popup_data = new Object();
				XKit.extensions.show_more.popup_data.error = true;
				XKit.console.add("show_more -> Can't parse popup_data:" + e.message);
			}

		} else {

			var m_req_id = XKit.extensions.show_more.popup_data.popup_data_req_id;

			if (!userlink_mode) { return; }

			GM_xmlhttpRequest({
				method: "GET",
				url: "http://www.tumblr.com/svc/tumblelog_popover/" + real_username + "?is_user_mention=false",
				json: false,
				headers: {
					"X-tumblr-form-key": XKit.interface.form_key(),
				},
				onerror: function(response) {
					if (m_req_id !== XKit.extensions.show_more.popup_data.popup_data_req_id) { console.log("show_more: Could not fetch data, also ID mismatch."); return; }
					console.log("show_more: Could not fetch data.");
					XKit.extensions.show_more.popup_data = new Object();
					XKit.extensions.show_more.popup_data.error = true;
					XKit.console.add("show_more -> Can't parse popup_data - not defined.");
				},
				onload: function(response) {

					if (m_req_id !== XKit.extensions.show_more.popup_data.popup_data_req_id) { console.log("show_more: Fetched data but ID mismatch."); return; }
					console.log("show_more: Successfully fetched and stored popup_data.");
					try {
						XKit.extensions.show_more.popup_data = JSON.parse(response.responseText);
					} catch(e){
						XKit.extensions.show_more.popup_data = new Object();
						XKit.extensions.show_more.popup_data.error = true;
					}

				}
			});

		}

	},

	store_data_avatar: function(e) {

		var m_obj = $(e.target);

		if (m_obj.hasClass("post_avatar_link") !== true) {
			while (m_obj.hasClass("post_avatar_link") !== true) {
				m_obj = m_obj.parent();
			}
		}

		try {
			XKit.extensions.show_more.popup_data = JSON.parse($(m_obj).attr('data-tumblelog-popover'));
		} catch(e) {
			XKit.console.add("show_more -> Can't parse popup_data");
			XKit.extensions.show_more.popup_data = new Object();
			XKit.extensions.show_more.popup_data.error = true;
		}

	},

	add_links_new: function() {

		console.log(XKit.extensions.show_more.popup_data);

		var m_parent;
		if ($(".tumblelog_popover_v1").length > 0) {
			m_parent = $(".tumblelog_popover_v1").find(".tumblelog_menu_popover").find("ul");
		} else {
			m_parent = $(".tumblelog_popover").find(".tumblelog_menu_popover").find("ul");
		}

		if ($(".info_popover").length > 0)
			m_parent = $(".info_popover").find("ul");

                $(m_parent).find(".xkit-avatar-magnetizer-new").parent().remove();

                if ($(m_parent).hasClass("show-more-done")) {return; }

                $(m_parent).addClass("show-more-done");

                var m_html = "";
                var avatar_url = XKit.extensions.show_more.popup_data.avatar_url;
                var user_url = XKit.extensions.show_more.popup_data.name;

		if (user_url === "xkit-extension") {

			$(m_parent).find(".ask").html("XKit Support");
			$(m_parent).find(".ask").addClass("xkit-support-ask");
			$(m_parent).find(".ask").removeClass("ask");

		}

                if (XKit.extensions.show_more.preferences.show_magnetizer.value === true) {

                	if (avatar_url !== "" && typeof avatar_url !== "undefined") {
                		m_html = m_html + "<li>" +
                				"<a onclick=\"return false;\" data-avatar-url=\"" + avatar_url + "\" class=\" xkit-new-menu-fix xkit-show-more-item xkit-avatar-magnetizer-new xkit-avatar-magnetizer-button-" + user_url + "\" data-user-url=\"" + user_url + "\">" +
                					"Magnifier" +
                				"</a>" +
                			  "</li>";
                	}

                }


                if (XKit.extensions.show_more.preferences.show_submits.value === true && XKit.extensions.show_more.submit_available[user_url] === true) {

                	var m_likes_url = "http://" + user_url + ".tumblr.com/submit";

                	m_html = m_html + "<li>" +
                			"<a target=\"_new\" href=\"" + m_likes_url + "\" class=\"likes xkit-submit xkit-new-menu-fix\">" +
                				"<span class=\"hide_overflow\">Submit</span>" +
                			"</a>" +
                		  "</li>";

                }

               // console.log(XKit.extensions.show_more.custom_menu_extension);
                if (XKit.extensions.show_more.custom_menu_extension.length >= 0) {

                	var m_data = XKit.extensions.show_more.popup_data;

                	for (var i=0;i<XKit.extensions.show_more.custom_menu_extension.length;i++) {

                		var returned_menu = "";

                		try {
                			returned_menu = XKit.extensions.show_more.custom_menu_function[i](m_data);
                		} catch(e) {
                			returned_menu = "";
                		}

                		m_html = m_html + returned_menu;
                	}

                }

		$(m_parent).append(m_html);

		// console.log(m_html);

		$(".xkit-avatar-magnetizer-button-" + user_url).unbind('click');
		$(".xkit-avatar-magnetizer-button-" + user_url).bind('click', function() {

			XKit.extensions.show_more.show_avatar(user_url);
			$(".tumblelog_popover_glass").trigger('click');
			setTimeout(function() { $(".tumblelog_popover_glass").trigger('click'); }, 10);
			$(".popover").hide();
			//$("#glass_overlay").removeClass("show");

		});

	},

	do_posts: function() {

		$('.tumblelog_menu_button').unbind('click', XKit.extensions.show_more.add_links);
		$('.tumblelog_menu_button').bind('click', XKit.extensions.show_more.add_links);

		if (XKit.extensions.show_more.preferences.show_submits.value === true) {

			var m_delay_count = 0;

			$(".post_avatar").not(".xkit-show-more-submits-done").each(function() {

				$(this).addClass("xkit-show-more-submits-done");

				var username = $(this).parent().attr('data-tumblelog-name');

				if (XKit.extensions.show_more.submit_available[username] === true ||
					XKit.extensions.show_more.submit_available[username] === false) {
					return;
				}

				var m_url = "https://www.tumblr.com/submit_form/" + username + ".tumblr.com";

				if (typeof username === "undefined" || username === "") {
					return;
				}

				// Temporarily set it to false while we fetch pages.
				XKit.extensions.show_more.submit_available[username] = false;

				setTimeout(function() {

					$.ajax({
 						url: m_url,
  						success: function(data, xhr) {
							XKit.extensions.show_more.submit_available[username] = true;
  						}
					});

				}, 100 + (m_delay_count * 100));

				m_delay_count++;

			});

		}

		if (XKit.extensions.show_more.preferences.enable_anon.value === true) {

			var m_delay_count = 0;

			$(".post_avatar").not(".xkit-show-more-anons-done").each(function() {

				$(this).addClass("xkit-show-more-anons-done");

				var username = $(this).parent().attr('data-tumblelog-name');

				if (XKit.extensions.show_more.anon_available[username] === true ||
					XKit.extensions.show_more.anon_available[username] === false) {
					return;
				}

				var m_url = "https://www.tumblr.com/ask_form/" + username + ".tumblr.com";

				if (typeof username === "undefined" || username === "") {
					return;
				}

				// Temporarily set it to false while we fetch pages.
				XKit.extensions.show_more.anon_available[username] = false;

				setTimeout(function() {

					$.ajax({
 						url: m_url,
  						success: function(data, xhr) {
  							if ($("#ask_anonymously", data).length > 0) {
								XKit.extensions.show_more.anon_available[username] = true;
							} else {
								XKit.console.add("No anon messages for " + username);
							}
  						}
					});

				}, 100 + (m_delay_count * 100));

				m_delay_count++;

			});

		}

		if (XKit.extensions.show_more.preferences.show_likes.value === true) {

			var m_delay_count = 0;

			$(".post_avatar").not(".xkit-show-more-likes-done").each(function() {

				$(this).addClass("xkit-show-more-likes-done");
				if ($(this).find(".xkit-likes").length > 0) { return;}

				var username = $(this).parent().attr('data-tumblelog-name');

				if (XKit.extensions.show_more.likes_available[username] === true ||
					XKit.extensions.show_more.likes_available[username] === false) {
					return;
				}

				var m_url = "https://www.tumblr.com/liked/by/" + username;

				if (typeof username === "undefined" || username === "") {
					return;
				}

				// Temporarily set it to false while we fetch pages.
				XKit.extensions.show_more.likes_available[username] = false;

				setTimeout(function() {

					$.ajax({
 						url: m_url,
  						success: function(data, xhr) {
							XKit.extensions.show_more.likes_available[username] = true;
  						}
					});

				}, 100 + (m_delay_count * 100));

				m_delay_count++;

			});

		}

	},

	add_links: function(e) {

		var menu_box = $(e.target).parent().find(".tumblelog_menu_popover");
		var user_url = $(menu_box).parent().find(".tumblelog_menu_link").attr('data-tumblelog-name');
		var m_class = "";

                var m_html = "";

                $(menu_box).find(".xkit-submit").parent().remove();
                $(menu_box).find(".xkit-likes").parent().remove();

                if (XKit.extensions.show_more.anon_available[user_url] === true) {

                	$(menu_box).find(".tumblelog_menu_link.ask").attr('data-anonymous-ask','1');

                }

                if (XKit.extensions.show_more.preferences.show_likes.value === true && XKit.extensions.show_more.likes_available[user_url] === true) {

                	var m_likes_url = "https://www.tumblr.com/liked/by/" + user_url;

                	m_html = m_html + "<div class=\"popover_menu_item\">" +
                			"<a href=\"" + m_likes_url + "\" class=\"tumblelog_menu_link likes xkit-likes\">" +
                				"<span class=\"hide_overflow\">Likes</span>" +
                			"</a>" +
                		  "</div>";

                }

                if (XKit.extensions.show_more.preferences.show_submits.value === true && XKit.extensions.show_more.submit_available[user_url] === true) {

                	var m_likes_url = "http://" + user_url + ".tumblr.com/submit";

                	m_html = m_html + "<div class=\"popover_menu_item\">" +
                			"<a target=\"_new\" href=\"" + m_likes_url + "\" class=\"tumblelog_menu_link likes xkit-submit\">" +
                				"<span class=\"hide_overflow\">Submit</span>" +
                			"</a>" +
                		  "</div>";

                }

                $(menu_box).find(".xkit-avatar-magnetizer").parent().remove();

                if (XKit.extensions.show_more.preferences.show_magnetizer.value === true) {

                	var avatar_url = $(menu_box).parentsUntil(".post_avatar").parent().find(".post_avatar_image").attr('src');

                	if (avatar_url !== "" && typeof avatar_url !== "undefined") {
                		m_html = m_html + "<div class=\"popover_menu_item\">" +
                				"<a onclick=\"return false;\" data-avatar-url=\"" + avatar_url + "\" class=\"tumblelog_menu_link xkit-avatar-magnetizer xkit-avatar-magnetizer-button-" + user_url + "\" data-user-url=\"" + user_url + "\">" +
                					"<span class=\"hide_overflow\">Magnifier</span>" +
                				"</a>" +
                			  "</div>";
                	}

                }


		//$(menu_box).find(".open_in_tab").parent().before(m_html);

		$(menu_box).find(".tumblelog_menu_popover").append(m_html);

		var m_target = e.target;

		$(".xkit-avatar-magnetizer-button-" + user_url).unbind('click');
		$(".xkit-avatar-magnetizer-button-" + user_url).bind('click', function() {

			XKit.extensions.show_more.show_avatar(user_url);
			setTimeout(function() { $("#glass_overlay").trigger('click'); }, 10);

			$(m_target).trigger('click');
			//$("#glass_overlay").removeClass("show");

		});

	},

	show_avatar: function(user_url) {

		if ($("#xkit-avatar-magnetizer-shadow").length > 0) {
			$("#xkit-avatar-magnetizer-shadow").remove();
			$("#xkit-avatar-magnetizer-window").remove();
		}

		avatar_url = "http://api.tumblr.com/v2/blog/" + user_url + ".tumblr.com/avatar/512";

		var m_html = 	"<div id=\"xkit-avatar-magnetizer-shadow\">&nbsp;</div>" +
				"<div id=\"xkit-avatar-magnetizer-window\">" +
					"<img src=\"" + avatar_url + "\">" +
					"<p>Click on the picture or the page to close</p>" +
				"</div>";

		$("body").append(m_html);

		$("#xkit-avatar-magnetizer-shadow").fadeIn('fast');
		$("#xkit-avatar-magnetizer-window").fadeIn('slow');

		$("#xkit-avatar-magnetizer-window, #xkit-avatar-magnetizer-shadow").click(function() {

			$("#xkit-avatar-magnetizer-shadow").fadeOut('slow');
			$("#xkit-avatar-magnetizer-window").fadeOut('fast');

		});

	},

	destroy: function() {
		$(".xkit-likes").parent().remove();
		$(".xkit-submit").parent().remove();
		$(".xkit-avatar-magnetizer").parent().remove();
		XKit.tools.remove_css("show_more_hide_follows");
		XKit.tools.remove_css("show_more_hide_previews");
		$(document).off('mouseover', '.post_info_fence a, .post_info a, a.username', XKit.extensions.show_more.store_data_username);
		$(document).off('mouseover', '.post_avatar_link', XKit.extensions.show_more.store_data_avatar);
		$(document).off('click','.tumblelog_menu_btn', XKit.extensions.show_more.add_links_new);
		this.running = false;
	}

});