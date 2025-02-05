    // Konfigurasi
    let currentPage = 2;
    let totalPages = 100;
    let searchQuery = '';
    const pageLimit = 10;

    // DOM Elements
    const loading = document.getElementById('loading');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const mobileMenuButton = document.getElementById('mobileMenuButton');
    const mobileMenu = document.getElementById('mobileMenu');
        // Mobile Menu
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            document.body.classList.toggle('overflow-hidden');
        });

        // Event
        document.getElementById('searchInput').addEventListener('input', (e) => {
            searchQuery = e.target.value;
            currentPage = 1;
            fetchAnime();
        });
        prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchAnime();
        }
        });

        nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchAnime();
        }
        });
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                mobileMenu.classList.add('hidden');
                document.body.classList.remove('overflow-hidden');
            }
        });

        document.addEventListener('click', (e) => {
            const animeCard = e.target.closest('.anime-card');
            if (animeCard) {
                const animeId = animeCard.dataset.id;
                showAnimeDetail(animeId);
            }
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('animeModal').classList.add('hidden');
        });

        document.getElementById('animeModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('animeModal')) {
                document.getElementById('animeModal').classList.add('hidden');
            }
        });
        // Fungsi untuk menampilkan detail anime
        async function showAnimeDetail(animeId) {
            try {
                const response = await fetch(`https://kitsu.io/api/edge/anime/${animeId}`);
                const { data } = await response.json();
                
                // Fetch genre
                const genresResponse = await fetch(data.relationships.genres.links.related);
                const genresData = await genresResponse.json();
                const genres = genresData.data.map(genre => genre.attributes.name).join(', ');

                const modalContent = `
                    <div class="flex flex-col md:flex-row gap-6">
                        <img 
                            src="${data.attributes.posterImage?.medium || 'https://via.placeholder.com/300'}" 
                            alt="${data.attributes.canonicalTitle}"
                            class="w-full md:w-1/3 rounded-lg object-cover"
                        >
                        
                        <div class="flex-1">
                            <h2 class="text-3xl font-bold text-white mb-4">
                                ${data.attributes.canonicalTitle}
                                <span class="font-noto-sans-jp text-lg text-gray-400 ml-2">
                                    (${data.attributes.titles.ja_jp || '-'})
                                </span>
                            </h2>
                            
                            <div class="grid grid-cols-2 gap-4 mb-6">
                                <div class="bg-gray-700 p-4 rounded-lg">
                                    <p class="text-sm text-gray-400">Rating</p>
                                    <p class="text-2xl text-yellow-400 font-bold">
                                        ⭐ ${data.attributes.averageRating || 'N/A'}
                                    </p>
                                </div>
                                <div class="bg-gray-700 p-4 rounded-lg">
                                    <p class="text-sm text-gray-400">Status</p>
                                    <p class="text-xl text-white font-bold">
                                        ${data.attributes.status.toUpperCase()}
                                    </p>
                                </div>
                                <div class="bg-gray-700 p-4 rounded-lg">
                                    <p class="text-sm text-gray-400">Episode</p>
                                    <p class="text-xl text-white font-bold">
                                        ${data.attributes.episodeCount || 'N/A'}
                                    </p>
                                </div>
                                <div class="bg-gray-700 p-4 rounded-lg">
                                    <p class="text-sm text-gray-400">Durasi</p>
                                    <p class="text-xl text-white font-bold">
                                        ${data.attributes.episodeLength || 'N/A'} menit
                                    </p>
                                </div>
                            </div>

                            <div class="mb-4">
                                <p class="text-sm text-gray-400">Genre</p>
                                <p class="text-white">${genres || 'Tidak ada genre'}</p>
                            </div>

                            <div class="mb-4">
                                <p class="text-sm text-gray-400">Sinopsis</p>
                                <p class="text-white leading-relaxed">
                                    ${data.attributes.synopsis || 'Tidak ada sinopsis'}
                                </p>
                            </div>

                            <div class="mt-6">
                                <a 
                                    href="${data.attributes.youtubeVideoId ? `https://youtu.be/${data.attributes.youtubeVideoId}` : '#'}" 
                                    target="_blank"
                                    class="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                    </svg>
                                    Tonton Trailer
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                document.getElementById('modalContent').innerHTML = modalContent;
                document.getElementById('animeModal').classList.remove('hidden');
            } catch (error) {
                console.error('Error fetching anime details:', error);
            }
        }

        // Fungsi API
        async function fetchAnime() {
            loading.classList.remove('hidden');
            const animeList = document.getElementById('animeList');
            animeList.innerHTML = '';

            try {
                const response = await fetch(
                    `https://kitsu.io/api/edge/anime?filter[text]=${searchQuery}&page[limit]=${pageLimit}&page[offset]=${(currentPage - 1) * pageLimit}`
                );
                const data = await response.json();
                
                // Hitung total halaman berdasarkan total data
                const totalItems = data.meta.count;
                totalPages = Math.ceil(totalItems / pageLimit);
                
                displayAnime(data.data);
                updatePagination();
            } catch (error) {
                console.error('Error:', error);
            } finally {
                loading.classList.add('hidden');
            }
        }

        // Fungsi untuk update tombol pagination
        function updatePagination() {
            const prevButton = document.getElementById('prevPage');
            const nextButton = document.getElementById('nextPage');
            
            prevButton.disabled = currentPage <= 2;            
            nextButton.disabled = currentPage >= totalPages;
        }

        // Fungsi untuk menampilkan anime
        function displayAnime(animes) {
            const animeList = document.getElementById('animeList');
            
            animes.forEach(anime => {
                const animeCard = `
                    <div class="anime-card bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:transform hover:scale-105 transition-transform" data-id="${anime.id}">
                        <img 
                            src="${anime.attributes.posterImage?.small || 'https://via.placeholder.com/300'}" 
                            alt="${anime.attributes.canonicalTitle}"
                            class="w-full h-48 object-cover"
                        >
                        <div class="p-4">
                            <h3 class="text-xl font-bold text-white mb-2 truncate">
                                ${anime.attributes.canonicalTitle}
                            </h3>
                            <p class="text-gray-400 text-sm mb-4 line-clamp-3">
                                ${anime.attributes.synopsis || 'Tidak ada sinopsis'}
                            </p>
                            <div class="flex justify-between items-center">
                                <span class="text-blue-400 text-sm">
                                    Eps: ${anime.attributes.episodeCount || 'N/A'}
                                </span>
                                <span class="text-yellow-400 text-sm">
                                    ⭐ ${anime.attributes.averageRating || '0'}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                animeList.innerHTML += animeCard;
            });
        }

        fetchAnime();