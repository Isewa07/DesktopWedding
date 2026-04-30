var i = 0,
	minimizedWidth = new Array,
	minimizedHeight = new Array,
	windowTopPos = new Array,
	windowLeftPos = new Array,
	panel,
	id;

function adjustFullScreenSize() {
	$(".fullSizeWindow .wincontent").css("width", (window.innerWidth - 8));
	$(".fullSizeWindow .wincontent").css("height", (window.innerHeight - 70));
}

function makeWindowActive(thisid) {
	$(".window").each(function() {
		$(this).css('z-index', $(this).css('z-index') - 1);
	});
	$("#window" + thisid).css('z-index', 1000);
	$(".window").removeClass("activeWindow");
	$("#window" + thisid).addClass("activeWindow");
	$(".taskbarPanel").removeClass('activeTab');
	$("#minimPanel" + thisid).addClass("activeTab");
}

function minimizeWindow(id) {
	windowTopPos[id] = $("#window" + id).css("top");
	windowLeftPos[id] = $("#window" + id).css("left");
	$("#window" + id).animate({
		top: 800,
		left: 0
	}, 200, function() { //animation complete
		$("#window" + id).addClass('minimizedWindow');
		$("#minimPanel" + id).addClass('minimizedTab');
		$("#minimPanel" + id).removeClass('activeTab');
	});
}

function openWindow(id) {
	if ($('#window' + id).hasClass("minimizedWindow")) {
		openMinimized(id);
	} else {
		makeWindowActive(id);
		$("#window" + id).removeClass("closed");
		$("#minimPanel" + id).removeClass("closed");
		// center window on open
		var $win = $("#window" + id);
		var winW = $win.outerWidth();
		var winH = $win.outerHeight();
		var left = Math.max(0, (window.innerWidth - winW) / 2);
		var top  = Math.max(0, (window.innerHeight - winH) / 2 - 16);
		$win.css({ left: left, top: top });
		windowLeftPos[id] = left + "px";
		windowTopPos[id]  = top  + "px";
	}
}

function closeWindwow(id) {
	$("#window" + id).addClass("closed");
	$("#minimPanel" + id).addClass("closed");
}

function openMinimized(id) {
	$('#window' + id).removeClass("minimizedWindow");
	$('#minimPanel' + id).removeClass("minimizedTab");
	makeWindowActive(id);
	$('#window' + id).animate({
		top: windowTopPos[id],
		left: windowLeftPos[id]
	}, 200, function() {});
}
$(document).ready(function() {
	$(".window").each(function() { // window template
		$(this).css('z-index', 1000)
		$(this).attr('data-id', i);
		minimizedWidth[i] = $(this).width();
		minimizedHeight[i] = $(this).height();
		windowTopPos[i] = $(this).css("top");
		windowLeftPos[i] = $(this).css("left");
		$("#taskbar").append('<div class="taskbarPanel" id="minimPanel' + i + '" data-id="' + i + '">' + $(this).attr("data-title") + '</div>');
		if ($(this).hasClass("closed")) {
			$("#minimPanel" + i).addClass('closed');
		}
		$(this).attr('id', 'window' + (i++));
		$(this).wrapInner('<div class="wincontent"></div>');
		$(this).prepend('<div class="windowHeader"><strong>' + $(this).attr("data-title") + '</strong><span title="Minimize" class="winminimize"><span></span></span><span title="Maximize" class="winmaximize"><span></span><span></span></span><span title="Close" class="winclose">x</span></div>');
	});
	$("#minimPanel" + (i - 1)).addClass('activeTab');
	$("#window" + (i - 1)).addClass('activeWindow');
	$(".wincontent").resizable(); // resizable
	$(".window").draggable({
		cancel: ".wincontent"
	}); // draggable
	$(".window").mousedown(function() { // active window on top (z-index 1000)
		makeWindowActive($(this).attr("data-id"));
	});
	$(".winclose").click(function() { // close window
		const closedId = $(this).parent().parent().attr("data-id");
		closeWindwow(closedId);
		if (closedId == 5) {
			const waAudio = document.getElementById('wa-audio');
			const waBtn = document.getElementById('wa-playpause');
			waAudio.pause();
			waAudio.currentTime = 0;
			waBtn.textContent = '▶';
		}
	});
	$(".winminimize").click(function() { // minimize window
		minimizeWindow($(this).parent().parent().attr("data-id"));
	});
	$(".taskbarPanel").click(function() { // taskbar click
		id = $(this).attr("data-id");
		if ($(this).hasClass("activeTab")) { // minimize if active
			minimizeWindow($(this).attr("data-id"));
		} else {
			if ($(this).hasClass("minimizedTab")) { // open if minimized
				openMinimized(id);
			} else { // activate if inactive
				makeWindowActive(id);
			}
		}
	});
	$(".openWindow").click(function() { // open closed window
		openWindow($(this).attr("data-id"));
	});
	$(".winmaximize").click(function() {
		if ($(this).parent().parent().hasClass('fullSizeWindow')) { // minimize
			$(this).parent().parent().removeClass('fullSizeWindow');
			$(this).parent().parent().children(".wincontent").height(minimizedHeight[$(this).parent().parent().attr("data-id")]);
			$(this).parent().parent().children(".wincontent").width(minimizedWidth[$(this).parent().parent().attr("data-id")]);
		} else { // maximize
			$(this).parent().parent().addClass('fullSizeWindow');
			minimizedHeight[$(this).parent().parent().attr('data-id')] = $(this).parent().parent().children(".wincontent").height();
			minimizedWidth[$(this).parent().parent().attr('data-id')] = $(this).parent().parent().children(".wincontent").width();
			adjustFullScreenSize();
		}
	});
	adjustFullScreenSize();

	// Apply window title translations after windows are built
	if (window.appLang) {
		const t = window.appLang;
		document.querySelectorAll('.window').forEach(function(win) {
			const originalTitle = win.getAttribute('data-title');
			const translated = t[originalTitle];
			if (translated) {
				const header = win.querySelector('.windowHeader strong');
				const taskbarPanel = document.querySelector('#minimPanel' + win.getAttribute('data-id'));
				if (header) header.textContent = translated;
				if (taskbarPanel) taskbarPanel.textContent = translated;
			}
		});
	}
});