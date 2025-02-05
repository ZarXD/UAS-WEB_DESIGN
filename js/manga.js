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
            fetchManga();
        });
        prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchManga();
        }
        });

        nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchManga();
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
            const mangaCard = e.target.closest('.manga-card');
            if (mangaCard) {
                const mangaId = mangaCard.dataset.id;
                showMangaDetail(mangaId);
            }
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('mangaModal').classList.add('hidden');
        });

        document.getElementById('mangaModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('mangaModal')) {
                document.getElementById('mangaModal').classList.add('hidden');
            }
        });
        // Fungsi untuk menampilkan detail manga
        async function showMangaDetail(mangaId) {
            try {
                const response = await fetch(`https://kitsu.io/api/edge/manga/${mangaId}`);
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
                                    <p class="text-sm text-gray-400">Chapter</p>
                                    <p class="text-xl text-white font-bold">
                                        ${data.attributes.chapterCount || 'N/A'}
                                    </p>
                                </div>
                                <div class="bg-gray-700 p-4 rounded-lg">
                                    <p class="text-sm text-gray-400">Volume</p>
                                    <p class="text-xl text-white font-bold">
                                        ${data.attributes.volumeCount || 'N/A'}
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
                        </div>
                    </div>
                `;

                document.getElementById('modalContent').innerHTML = modalContent;
                document.getElementById('mangaModal').classList.remove('hidden');
            } catch (error) {
                console.error('Error fetching manga details:', error);
            }
        }

        // Fungsi API
        async function fetchManga() {
            loading.classList.remove('hidden');
            const mangaList = document.getElementById('mangaList');
            mangaList.innerHTML = '';

            try {
                const response = await fetch(
                    `https://kitsu.io/api/edge/manga?filter[text]=${searchQuery}&page[limit]=${pageLimit}&page[offset]=${(currentPage - 1) * pageLimit}`
                );
                const data = await response.json();
                
                // Hitung total halaman berdasarkan total data
                const totalItems = data.meta.count;
                totalPages = Math.ceil(totalItems / pageLimit);
                
                displayManga(data.data);
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

        // Fungsi untuk menampilkan manga
        function displayManga(mangas) {
            const mangaList = document.getElementById('mangaList');
            
            mangas.forEach(manga => {
                const mangaCard = `
                    <div class="manga-card bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:transform hover:scale-105 transition-transform" data-id="${manga.id}">
                        <img 
                            src="${manga.attributes.posterImage?.small || 'https://via.placeholder.com/300'}" 
                            alt="${manga.attributes.canonicalTitle}"
                            class="w-full h-48 object-cover"
                        >
                        <div class="p-4">
                            <h3 class="text-xl font-bold text-white mb-2 truncate">
                                ${manga.attributes.canonicalTitle}
                            </h3>
                            <p class="text-gray-400 text-sm mb-4 line-clamp-3">
                                ${manga.attributes.synopsis || 'Tidak ada sinopsis'}
                            </p>
                            <div class="flex justify-between items-center">
                                <span class="text-blue-400 text-sm">
                                    Ch: ${manga.attributes.chapterCount || 'N/A'}
                                </span>
                                <span class="text-yellow-400 text-sm">
                                    ⭐ ${manga.attributes.averageRating || '0'}
                                </span>
                            </div>
                        </div>
                    </div>
                `;
                mangaList.innerHTML += mangaCard;
            });
        }
        fetchManga();