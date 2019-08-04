;(function () {
	'use strict';

	const apiKey = '96e2813c92bd81bbf1ef27719081c7d5';

	const urlPoster= 'https://image.tmdb.org/t/p/w500';
	const noPosterPath = './img/noposter.jpg';

	const movieElement = document.querySelector('#movie');
	const searchFormElement = document.querySelector('#search-form');
	const backElement = document.querySelector('#back');

	let id = '';
	id = getGet('id');

	let type = '';
	type = getGet('type');

	let url = '';

	if(type === 'movie') {
		url = 'https://api.themoviedb.org/3/movie/' + id + '?api_key=' + apiKey + '&language=ru';
	} else if(type === 'tv') {
		url = 'https://api.themoviedb.org/3/tv/' + id + '?api_key=' + apiKey + '&language=ru';
	} else {
		movieElement.innerHTML = '<p class="info">Произошла ошибка. Повторите позже.</p>';
	}

	fetch(url)
	.then(function (value) {
		if(value.status !== 200) {
			return Promise.reject(new Error(value.status));
		}
		return value.json();
	})
	.then((output) => {
		let genres = '';
		output.genres.forEach((item) => {
				genres += item.name + ', ';
			});
		let nameItem = output.name || output.title;
		const poster = output.poster_path ? urlPoster + output.poster_path : noPosterPath;

		movieElement.innerHTML = `
		<div class="left">
			<img src="${poster}" class="img_poster" alt="${nameItem}">
			<span class="movie_vote_average movie_vote_average_description">${output.vote_average}</span>
			${(output.homepage) ? `<p class="movie_homepage_link"><a href="${output.homepage}" target="_blank">Официальная страница</a></p>` : ''}
			${(output.imdb_id) ? `<p class="movie_homepage_link"><a href="https://imdb.com/title/${output.imdb_id}" target="_blank">Страница на IMDB.com</a></p>` : ''}
		</div>
		<div class="right">
			<h4 class="movie_name movie_name_left">${output.name || output.title}</h4>
			<p class="movie_name_original">(${output.original_name || output.original_title})</p>
			<p><span>Премьера:</span> ${output.first_air_date || output.release_date}</p>
			<p><span>Статус:</span> ${output.status ?
						output.status : 'Статус отсутствует'}</p>
			<p><span>Жанр:</span> ${genres.substring(0, genres.length - 2) ?
						genres.substring(0, genres.length - 2) : 'Жанр отсутствует'}</p>
			${(output.last_episode_to_air) ? `<p><span>Количество сезонов:</span> ${output.number_of_seasons}</p>` : ''}
			<p><span>Описание:</span> ${(output.overview) ?
						output.overview : 'Описание отсутствует'}</p>
			<p><span>Трейлер:</span></p>
			<p class="youtube"></p>
		</div>
		`;

		getVideo(type, id);
	})
	.catch(function (reason) {
		movieElement.innerHTML = '<p class="info">Упс, что-то пошло не так!</p>';
		console.error('error: ' + reason);
	});
	

	function getVideo(type, id) {
		let youtube = movieElement.querySelector('.youtube');

		fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${apiKey}&language=ru`)
		.then((value) => {
			if(value.status !== 200) {
				return Promise.reject(new Error(value.status));
			}
			return value.json();
		})
		.then((output) => {
			let videoFrame = '';

			if(output.results.length === 0) {
				videoFrame = 'К сожалению, видео отсутствует';
			}
			output.results.forEach((item) => {
				videoFrame += '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + item.key + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
			});
			youtube.innerHTML = videoFrame;
		})
		.catch((reason) => {
			youtube.innerHTML = 'Видео отсутствует!';
			console.error('error: ' + reason);
		});
	}

	backElement.onclick = function() {
		localStorage.setItem('goToBack', 'true');
		if(localStorage.getItem('query')) {
			location.replace('index.html?q=' + localStorage.getItem('query'));
		} else {
		    location.replace('index.html');
		}
	 };

	function getGet(name) {
		let s = window.location.search;
	    s = s.match(new RegExp(name + '=([^&=]+)'));
	    return s ? s[1] : false;
	}

	searchFormElement.addEventListener('submit', openListMovies);

	function openListMovies(event) {
		event.preventDefault();	
		const searchText = document.querySelector('#search-text').value;
		if (searchText.trim().length === 0) {
			return;
		}
		localStorage.setItem('query', searchText);
		location.replace('index.html?q=' + searchText);
	}

})();