var abooksIndexFilename = "abooks-index.json";

app.service('SvcMyABooks', ['$cordovaFile',
function($cordovaFile) {
 	var abooks = new Array();
	  	
	document.addEventListener('deviceready', function () {
		$cordovaFile.checkFile(cordova.file.documentsDirectory, abooksIndexFilename)
		.then(function (success) {
			abooks = JSON.parse($cordovaFile.readAsText(cordova.file.documentsDirectory, abooksIndexFilename));
			$cordovaFile.createFile(cordova.file.documentsDirectory, "aa", true);
		}, 
		function (error) {
			$cordovaFile.createFile(cordova.file.documentsDirectory, abooksIndexFilename, true);
			console.log(error);
		});
	});
	
	var updateABooksFile = function() {
		$cordovaFile.writeFile(cordova.file.documentsDirectory, abooksIndexFilename, JSON.stringify(abooks), true)
			.then(function (success) {				
			}, function (error) {
				console.log(error);
			});
	}
	
	var getABookIndex = function(id) {
		if (abooks) {
			for (var i=0; i<abooks.length; i++) {
				if (abooks[i].id==id) {
					return i;
				}
			}
		}
	}
	
	function addBook(book) {
		if (getABookIndex(book.id)>0) {
			abooks.push({
				id: book.id,
				title: book.title
			});
			
			updateABooksFile();			
		}
	}
	
	function deleteBook(id) {
		abooks.splice(getABookIndex(id), 1);
		
		updateABooksFile();
	}
	
	function getBooks() {
		return abooks;
	}

	return {
		addBook: addBook,
		deleteBook: deleteBook,
		getBooks: getBooks
	}
}]);