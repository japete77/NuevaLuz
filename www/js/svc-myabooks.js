var abooksIndexFilename = "abooks-index.json";
var workingDir = "";

app.service('SvcMyABooks', ['$cordovaFile',
function($cordovaFile) {
 	var abooks = new Array();
	var ready = false;
	  	
	document.addEventListener('deviceready', function () {
		ready = true;
		
		var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : "Android";
		
		switch (deviceType) {
			case "iPad":
			case "iPhone":
				workingDir = cordova.file.documentsDirectory;
				break;
			default:
				workingDir = cordova.file.dataDirectory;
				break;
		}
	});
	
	var updateABooksFile = function() {
		if (ready) {
			$cordovaFile.writeFile(workingDir, abooksIndexFilename, JSON.stringify(abooks), true)
				.then(function (success) {				
				}, function (error) {
					console.log(error);
				});
		}
	}
	
	var getABookIndex = function(id) {
		if (abooks) {
			for (var i=0; i<abooks.length; i++) {
				if (abooks[i].id==id) {
					return i;
				}
			}
		}
		return -1;
	}
	
	function addUpdateBook(book) {
		var index = getABookIndex(book.id); 
		if (index<0) {
			abooks.push({
				id: book.id,
				title: book.title,
				status: book.progress<100?'downloading':'downloaded'
			});
			
		}
		else {
			// update book status
			abooks[index].status = book.progress<100?'downloading':'downloaded';	
		}
		updateABooksFile();			
	}
	
	function deleteBook(id) {
		abooks.splice(getABookIndex(id), 1);	
		updateABooksFile();
	}
	
	function getBooks(callback) {
		if (ready) {
			$cordovaFile.checkFile(workingDir, abooksIndexFilename)
			.then(function (success) {
				$cordovaFile.readAsText(workingDir, abooksIndexFilename)
				.then(function(result) {
					abooks = JSON.parse(result);
					callback(abooks);
				},
				function(error) {
					console.log(error);
				});
			}, 
			function (error) {
				$cordovaFile.createFile(workingDir, abooksIndexFilename, true);
				console.log(error);
			});
		}
	}

	return {
		addUpdateBook: addUpdateBook,
		deleteBook: deleteBook,
		getBooks: getBooks
	}
}]);