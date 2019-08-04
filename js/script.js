;(function () {
	'use strict';

	const apiKey = '96e2813c92bd81bbf1ef27719081c7d5';

	const searchForm = document.querySelector('#search-form');
	const moviesElement = document.querySelector('#movies');
	const sectionHeader = document.querySelector('#section-header');

	const urlPoster= 'https://image.tmdb.org/t/p/w500';
	const noPosterPath = './img/noposter.jpg';

	function apiSearch(event) {
		event.preventDefault();	
		const searchText = document.querySelector('#search-text').value;
		
		if (searchText.trim().length === 0) {
			return;
		}
		const server = 'https://api.themoviedb.org/3/search/multi?api_key=' + apiKey +'&language=ru&query=' + searchText;

		localStorage.setItem('query', searchText);
		location.replace('index.html?q=' + searchText);
	}

	searchForm.addEventListener('submit', apiSearch);

	function addEventMedia() {
		const media = moviesElement.querySelectorAll('.item');
		media.forEach(function (elem) {
			elem.style.cursor = 'pointer';
			elem.addEventListener('click', openFullInfo);
		});
	}

	function openFullInfo(event) {
		let box = this.getBoundingClientRect();
		let clickY = box.top + pageYOffset;

	    localStorage.setItem('positionY', clickY);

		location.replace('movie.html?id=' + this.dataset.id + '&type=' + this.dataset.type);
	}

	document.addEventListener('DOMContentLoaded', function () {
		const query = location.search.substr(3);
		sectionHeader.innerHTML = '<div class="spinner"></div>';

		if(query) {
			const server = 'https://api.themoviedb.org/3/search/multi?api_key=' + apiKey +'&language=ru&query=' + query;

			fetch(server)
			.then(function (value) {
				if(value.status !== 200) {
					return Promise.reject(new Error(value.status));
				}
				return value.json();
			})
			.then(function (output) {
				let inner = '';

				if (output.results.length === 0) {
					sectionHeader.innerHTML = '<p class="info">По вашему запросу ничего не найдено</p>';
				}

				output.results.forEach(function (item) {
					if(item.media_type === 'person') {
						return;
					}
					let nameItem = item.name || item.title;
					const poster = item.poster_path ? urlPoster + item.poster_path : noPosterPath;
					let dataInfo = '';
					
					dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;
					
					inner += `
						<div class="item" ${dataInfo}>
							<img src="${poster}" class="img_poster" alt="${nameItem}">
							<span class="movie_vote_average">${item.vote_average}</span>
							<h4 class="movie_name">${nameItem}</h4>
							<p class="movie_date">Премьера: ${item.first_air_date || item.release_date}</p>
							<p class="movie_description">${(item.overview) ?
								item.overview.substr(0,130) + '...' : 'Описание отсутствует'} </p>
						</div>
					`;
				});
				sectionHeader.innerHTML = '';
				moviesElement.innerHTML = inner; 

				if (localStorage.getItem('goToBack') == 'true') {
					window.scrollTo(0, localStorage.getItem('positionY'));
					localStorage.setItem('goToBack', 'false');
				}
				addEventMedia();
			})
			.catch(function (reason) {
				moviesElement.innerHTML = '<p class="info">Упс, что-то пошло не так!</p>';
				console.error('error: ' + reason);
			});
		} else {
			fetch('https://api.themoviedb.org/3/trending/all/week?api_key=' + apiKey + '&language=ru')
			.then(function (value) {
				if(value.status !== 200) {
					return Promise.reject(new Error(value.status));
				}
				return value.json();
			})
			.then(function (output) {
				let inner = '';
				let header = '<h3 class="text-header">Популярные за неделю:</h3>';

				if (output.results.length === 0) {
					header = '<p class="info">По вашему запросу ничего не найдено</p>';
				}

				output.results.forEach(function (item) {
					let nameItem = item.name || item.title;
					let mediaType = item.title ? 'movie' : 'tv';
					const poster = item.poster_path ? urlPoster + item.poster_path : './img/noposter.jpg';
					let dataInfo = `data-id="${item.id}" data-type="${mediaType}"`;

					inner += `
						<div class="item" ${dataInfo}>
							<img src="${poster}" class="img_poster" alt="${nameItem}">
							<span class="movie_vote_average">${item.vote_average}</span>
							<h4 class="movie_name">${nameItem}</h4>
							<p class="movie_date">Премьера: ${item.first_air_date || item.release_date}</p>
							<p class="movie_description">${(item.overview) ?
								item.overview.substr(0,130) + '...' : 'Описание отсутствует'} </p>
						</div>
					`;
				});

				moviesElement.innerHTML = inner;
				sectionHeader.innerHTML = header; 

				localStorage.removeItem('query');

				if (localStorage.getItem('goToBack') == 'true') {
					window.scrollTo(0, localStorage.getItem('positionY'));
					localStorage.setItem('goToBack', 'false');
				}

				addEventMedia();
			})
			.catch(function (reason) {
				moviesElement.innerHTML = '<p class="info">Упс, что-то пошло не так!</p>';
				console.error('error: ' + reason);
			});
		}
	});
})();