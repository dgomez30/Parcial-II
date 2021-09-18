    //obtiene la referencia al contenedor main
    const main = document.querySelector(".main");
    var isAplicaFiltro = false;

    function buscarPelicula(query) {
        main.innerHTML = "";
        isAplicaFiltro = false;
        if (query.length === 0) {
            fetch(
                    genres_list_http +
                    new URLSearchParams({
                        api_key: api_key,
                    })
                )
                .then((res) => res.json())
                .then((data) => {
                    data.genres.forEach((item) => {
                        fetchListaPeliculasPorGenero(item.id, item.name);
                    });
                });
        } else {
            let urlBuscar = search_pelicula_http +
                new URLSearchParams({
                    api_key: api_key,
                }) + "&language=es&query=" + query + " &page=1&include_adult=false";

            fetch(urlBuscar)
                .then((res) => res.json())
                .then((data) => {
                    construirElementoCategoria("Coincidencias", data.results)
                });
        }
    }

    let urlCategorias = categorias_pelicula +
        new URLSearchParams({
            api_key: api_key,
        }) + "&language=es";

    fetch(urlCategorias)
        .then(res => res.json())
        .then(res => cargarCategorias(res));

    function cargarCategorias(peticion) {
        var sel = document.getElementById('ddlGenero');

        var array = Object.values(peticion.genres);

        array.forEach(item => {
            var opt = document.createElement('option');
            opt.innerHTML = opt.value = item.id;
            opt.innerHTML = opt.text = item.name;

            sel.appendChild(opt);
        });
    }

    function buscarPeliculasPorFiltro() {
        main.innerHTML = "";
        let idClasificacion = document.getElementById('ddlClasificacion').value;
        let fechaEstreno = document.getElementById('txtEstreno').value;
        let genero = document.getElementById('ddlGenero').value;
        let isAdulto = document.getElementById('ddlContenidoAdulto').value;
        let anio = 0;

        if (fechaEstreno.length == 4) {
            anio = Number(fechaEstreno);
        }

        if (idClasificacion.length > 0) {
            idClasificacion = "&certification.lte=" + document.getElementById('ddlClasificacion').value;
        }

        if (isAdulto.length > 0) {
            isAdulto = "&certification.lte=" + document.getElementById('ddlContenidoAdulto').value;
        }

        if (anio > 1950) {
            fechaEstreno = "&primary_release_year=" + anio;
        }

        isAplicaFiltro = true;
        let urlClasificacion = peliculas_genero +
            new URLSearchParams({
                api_key: api_key,
            }) + "&language=es&sort_by=popularity.desc&certification_country=US" + idClasificacion + fechaEstreno + isAdulto;

        console.log(urlClasificacion);

        let mensajeCategoria = (idClasificacion == "" && fechaEstreno == "" && genero == "" && isAdulto == "") ?
            "Visualizacion sin Filtros..." : "Visualizacion por Filtros... ";

        fetch(urlClasificacion)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                construirElementoCategoria(mensajeCategoria, data.results);
            });

        modal.style.display = "none";
    }

    /* consigue el listado de generos */
    fetch(
            genres_list_http +
            new URLSearchParams({
                api_key: api_key,
            }) + "&language=es"
        )
        .then((res) => res.json())
        .then((data) => {
            data.genres.forEach((item) => {
                fetchListaPeliculasPorGenero(item.id, item.name);
            });
        });

    const fetchListaPeliculasPorGenero = (id, genres) => {
        var tituloCard = "Peliculas de ";

        fetch(
                movie_genres_http +
                new URLSearchParams({
                    api_key: api_key,
                    with_genres: id,
                    page: Math.floor(Math.random() * 3) + 1, //trae pagina al azar
                }) + "&language=es"
            )
            .then((res) => res.json())
            .then((data) => {
                if (isAplicaFiltro) {
                    tituloCard = "Visualizacion por Filtros... ";
                }

                construirElementoCategoria(tituloCard + genres, data.results);
            })
            .catch((err) => console.log(err));
    };

    /* crea el titulo de categoria */
    const construirElementoCategoria = (category, data) => {
        main.innerHTML += `
        <div class="movie-list">
            <button class="pre-btn"> <img src="img/pre.png" alt=""></button>
            
            <h1 class="movie-category">${category.split("_").join(" ")}</h1>

            <div class="movie-container" id="${category}">
            </div>

            <button class="nxt-btn"> <img src="img/nxt.png" alt=""> </button>
        </div>
        `;
        construirTarjetas(category, data);
    };

    const construirTarjetas = (id, data) => {
        if (isAplicaFiltro) {
            cargarPeliculasFiltradas(id, data);
        } else {
            const movieContainer = document.getElementById(id);
            data.forEach((item, i) => {
                if (item.backdrop_path == null) {
                    item.backdrop_path = item.poster_path;
                    if (item.backdrop_path == null) {
                        return;
                    }
                }
                movieContainer.innerHTML += `
                <div class="movie" onclick="location.href = '/${item.id}'">
                    <img src="${img_url}${item.backdrop_path}" alt="">
                    <p class="movie-title">${item.title}</p>
                </div>
                `;

                if (i == data.length - 1) {
                    setTimeout(() => {
                        setupScrolling();
                    }, 100);
                }
            });
        }
    };

    function cargarPeliculasFiltradas(id, data) {
        let selectGenero = document.getElementById('ddlGenero').value;
        let generoInclude = false;
        let isGenerado = (selectGenero != "") ? true : false;

        const movieContainer = document.getElementById(id);
        data.forEach((item, i) => {
            generoInclude = item.genre_ids.includes(Number(selectGenero));

            if (item.backdrop_path == null) {
                item.backdrop_path = item.poster_path;
                if (item.backdrop_path == null) {
                    return;
                }
            }

            if (generoInclude != isGenerado) {
                return;
            }

            movieContainer.innerHTML += `
                <div class="movie" onclick="location.href = '/${item.id}'">
                    <img src="${img_url}${item.backdrop_path}" alt="">
                    <p class="movie-title">${item.title}</p>
                </div>`;

            if (i == data.length - 1) {
                setTimeout(() => {
                    setupScrolling();
                }, 100);
            }

        });

        isAplicaFiltro = false;
    }

    function buscarSeriesTV() {
        main.innerHTML = "";

        fetch(
                series_tv +
                new URLSearchParams({
                    api_key: api_key,
                    page: Math.floor(Math.random() * 3) + 1, //trae pagina al azar
                }) + "&language=es"
            )
            .then((res) => res.json())
            .then((data) => {
                console.log(data.results);
                construirElementoCategoriaTV("Series de Television", data.results);
            })
            .catch((err) => console.log(err));
    }

    const construirElementoCategoriaTV = (category, data) => {
        main.innerHTML += `
        <div class="movie-list">
            <button class="pre-btn"> <img src="img/pre.png" alt=""></button>
            
            <h1 class="movie-category">${category.split("_").join(" ")}</h1>

            <div class="movie-container" id="${category}">
            </div>

            <button class="nxt-btn"> <img src="img/nxt.png" alt=""> </button>
        </div>
        `;
        construirTarjetasTV(category, data);
    };

    const construirTarjetasTV = (id, data) => {
        const movieContainer = document.getElementById(id);

        data.forEach((item, i) => {
            if (item.backdrop_path == null) {
                item.backdrop_path = item.poster_path;
                if (item.backdrop_path == null) {
                    return;
                }
            }

            item.id = item.id + "_TV";

            movieContainer.innerHTML += `
            <div class="movie" onclick="location.href = '/${item.id}'">
                <img src="${img_url}${item.backdrop_path}" alt="">
                <p class="movie-title">${item.name}</p>
            </div>
            `;

            if (i == data.length - 1) {
                setTimeout(() => {
                    setupScrolling();
                }, 100);
            }
        });
    };


    function buscarPeliculasCine() {
        let urlCine = movie_genres_http +
            new URLSearchParams({
                api_key: api_key,
            }) + "&language=es&primary_release_date.gte=2021-09-01&primary_release_date.lte=2021-09-30";

        fetch(urlCine)
            .then((res) => res.json())
            .then((data) => {
                console.log(data.results);
                main.innerHTML = "";
                construirElementoCategoria("Estrenos en el cine....", data.results);
            })
            .catch((err) => console.log(err));
    }

    function buscarMejoresPeliculasR() {
        let urlMejoresR = movie_genres_http +
            new URLSearchParams({
                api_key: api_key,
            }) + "&language=es&sort_by=vote_average.desc&certification_country=US&certification=R";

        fetch(urlMejoresR)
            .then((res) => res.json())
            .then((data) => {
                console.log(data.results);
                main.innerHTML = "";
                construirElementoCategoria("Mejores R calificadas...", data.results);
            })
            .catch((err) => console.log(err));
    }