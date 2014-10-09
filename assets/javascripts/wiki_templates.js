$(function() {

	function dmy() {
		var date = new Date();
		var d  = date.getDate();
		var day = (d < 10) ? '0' + d : d;
		var m = date.getMonth() + 1;
		var month = (m < 10) ? '0' + m : m;
		var yy = date.getYear();
		var year = (yy < 1000) ? yy + 1900 : yy;
		return year + "-" + month + "-" + day;
	}

	function getWeek(date) {
	  // Create a copy of this date object
	  var target  = new Date(date.valueOf());

	  // ISO week date weeks start on monday
	  // so correct the day number
	  var dayNr   = (date.getDay() + 6) % 7;

	  // ISO 8601 states that week 1 is the week
	  // with the first thursday of that year.
	  // Set the target date to the thursday in the target week
	  target.setDate(target.getDate() - dayNr + 3);

	  // Store the millisecond value of the target date
	  var firstThursday = target.valueOf();

	  // Set the target to the first thursday of the year
	  // First set the target to january first
	  target.setMonth(0, 1);
	  // Not a thursday? Correct the date to the next thursday
	  if (target.getDay() != 4) {
	    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
	  }

	  // The weeknumber is the number of weeks between the
	  // first thursday of the year and the thursday in the target week
	  var week = 1 + Math.ceil((firstThursday - target) / 604800000);
	  return week < 10 ? '0' + week : week;
	}

	var base_url = $('body.controller-wiki #main-menu a.wiki').attr('href');

	var new_page = $('<a href="#">New page</a>')
		.click(function() {
			var name = prompt("Page title:");
			if (name) {
			  window.location.href = base_url + "/" + encodeURI(name);
			}
		});

	var new_todo = $('<a href="#">New todo</a>')
		.click(function() {
			var name = prompt("Todo list name:");
			var template = "* {{todo}} Task 1 — {{user(admin)}}\n* {{done}} Task 2 — {{user(admin)}}\n";
			if (name) {
				window.location.href = base_url + "/" + encodeURI(dmy() + ' Todo ' + name) + '?text=' + encodeURI(template);
			}
		});

	var new_minutes = $('<a href="#">New meeting minutes</a>')
		.click(function() {
			var name = prompt("Meeting title:");
			var template = "Attendees:\n* \n\nAgenda:\n* \n\nMinutes:\n* ";
			if (name) {
				window.location.href = base_url + "/" + encodeURI(dmy() + ' Meeting ' + name) + '?text=' + encodeURI(template);
			}
		});

	var new_roadmap = $('<a href="#">New roadmap</a>')
		.click(function() {
			var name = prompt("Roadmap title :", "Roadmap");
			var week = 7 * 24 * 3600 * 1000;
			var weeks = "";
			var emptyWeeks = "";
			var today = (new Date()).getTime();
			for (var i = 0; i < 10; i++) {
				var d = new Date(today + (i * week));
				weeks += "_. W" + getWeek(d) + " |";
				emptyWeeks += "       |";
			}
			var template = "|                  |" + weeks + "\n" +
				"| *_GROUP 1_* |\n" +
				"| {{issue(00001)}} |" + emptyWeeks  + "\n" +
				"| *_GROUP 2_* |\n" +
				"| {{issue(00001)}} |" + emptyWeeks  + "\n";
			if (name) {
				window.location.href = base_url + "/" + encodeURI(name) + '?text=' + encodeURI(template);
			}
		});

	$("body.controller-wiki #main #sidebar h3:first")
		.after("<br><br>")
		.after(new_roadmap)
		.after("<br>")
		.after(new_minutes)
		.after("<br>")
		.after(new_todo)
		.after("<br>")
		.after(new_page)
});