var litCommute = {};
litCommute.key = 'AIzaSyDAFFNX_H2r-7YNi9-b3HfY9cUagJCGHjw';

function displayNext (elementClass) {
  return $(elementClass).css('display', 'flex');
}

function scrollToNext (elementClass) {
  return $('html, body').animate({
    scrollTop: $(elementClass).offset().top
  }, 500);
}

//Events that listen for a form submit
litCommute.events = function(){
	$('form').on('submit', function(e){
		e.preventDefault();

		//On submit gather the data for locations and book
		litCommute.usersOrigin = $('#origin').val();
		litCommute.usersDestination = $('#destination').val();
		litCommute.usersBook = $('#bookName').val();

		if (litCommute.usersOrigin !== '' && litCommute.usersDestination !== '' && litCommute.usersBook !== '') {
			$('.loader-backdrop').css('display', 'block');
			litCommute.getCommuteData(litCommute.usersOrigin, litCommute.usersDestination)
		} else {
			alert('Please fill out the form');
		}

	});
}

//Send location to google distance api
litCommute.getCommuteData = function(origin, destination){
	var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
    {
        origins: [origin],
        destinations: [destination],
        travelMode: 'TRANSIT'
    }, litCommute.handleCommuteData);
}

//function for calculating commute time
litCommute.handleCommuteData = function (response, status){
	// console.log(response, status);
	if (status !== 'OK') {
	    console.log('there was an error');
	} else {
		console.log(response);
	    var durationVal = response.rows[0].elements[0].duration.value;
	    // convert durationVal to minutes to use for later
	    litCommute.commuteTime = Math.round(durationVal / 60);
	    console.log(litCommute.commuteTime);

	    //All stored. Now set book as a global and pass user's book to the function that gets page count 
	    litCommute.getPageCount(litCommute.usersBook);
	}
};

//a function that gets page count
litCommute.getPageCount = function(){
	$.ajax({
		url: 'https://www.googleapis.com/books/v1/volumes',
		method: 'GET',
		dataType: 'json',
		data: {
			key: litCommute.key,
			format: 'json',
			q: litCommute.usersBook,
		}
	}).then(function(usersBook){
		// console.log(usersBook);
		litCommute.bookTitle = usersBook.items[0].volumeInfo.title;
		litCommute.pageCountData = usersBook.items[0].volumeInfo.pageCount;
		console.log(litCommute.pageCountData);
		// convert litCommute.pageCountData to reading time in minutes to use later, assuming average reading speed is 1.75 mins per page
		litCommute.readingTime = Math.round(litCommute.pageCountData * 1.75);
		console.log(litCommute.readingTime);

		//a function that calculates the number of commutes it'll take to finish book
		litCommute.result = Math.round(litCommute.readingTime / litCommute.commuteTime);
		console.log(litCommute.result);

		litCommute.displayResult(litCommute.result);

		$('.loader-backdrop').css('display', 'none');
	})
}

//Display result
litCommute.displayResult = function () {
	var title = $('.numOfCommutes').text(litCommute.result);
	var book = $('.book').text(litCommute.bookTitle);
	var days = $('.days').text(litCommute.result / 2);
	displayNext('.result');
	scrollToNext('.result');
	$('.inputs').css('display', 'none');
}

//function for displaying sections
litCommute.displaySection = function(){
	$('.startLink').on('click', function () {
	  displayNext('.inputs');
	  scrollToNext('.inputs');
	  $('.landing').css('display', 'none');
	});

	$('.reset').on('click', function() {
	  $('.inputs').css('display', 'none');
	  $('input[type=text]').val('');
	  $('span').empty();
	  $('.result').css('display', 'none');
	  document.body.scrollTop = 0;
	  $('.landing').css('display', 'flex');
	});
}

//Start app
litCommute.init = function(){
	litCommute.events();
	litCommute.displaySection();
}

//document ready that will run our init
$(function() {
	litCommute.init();
});