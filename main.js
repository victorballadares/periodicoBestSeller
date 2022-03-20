//firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js";
import { getFirestore, collection, where, getDocs, addDoc, query } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js";
const firebaseConfig = {
    

    //Aqui introduce tu config de firebase



  };
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const fs = getFirestore();

//variables y elementos
const api_key = 'Aquí va tu api key ';
const api_url = 'https://api.nytimes.com/svc/books/v3/lists/';

//en carga
window.onload = () => {
    toggle_options();
    const best_sellers_container = document.getElementById('best_sellers');
    const best_sellers = new CustomFetch(api_url + 'names.json?api-key=' + api_key);
    best_sellers.beforeSend(() => {
        const loading = document.getElementById('loading');
        loading.style.display = "block"
    });
    const fetch_best_sellers = best_sellers.fetch();
    fetch_best_sellers.then(res => res.json())
        .then(data => {
            const loading = document.getElementById('loading');
            loading.style.display = "none";
            data.results.forEach(list => {
                let section = document.createElement("section");
                section.className = "list";
                //titulo
                let h2 = document.createElement("h2");
                h2.innerHTML = list.list_name;
                section.appendChild(h2);
                //primero
                let oldest = document.createElement("p");
                oldest.innerHTML = "Oldest: " + list.oldest_published_date;
                section.appendChild(oldest);
                //ultimo
                let newest = document.createElement("p");
                newest.innerHTML = "Newest: " + list.newest_published_date;
                section.appendChild(newest);
                //frecuencia
                let frecuency = document.createElement("p");
                frecuency.innerHTML = "Frecuency: " + list.updated;
                section.appendChild(frecuency);
                //mostras lista
                let button = document.createElement("button");
                button.innerHTML = "Read more";
                button.onclick = () => { loadList(list.list_name_encoded) };
                section.appendChild(button);
                best_sellers_container.appendChild(section);
            });
        });
};

//listeners
const btn_sign_up = document.getElementById("btn_sign_up");
const btn_sign_in = document.getElementById("btn_sign_in");
const btn_sign_out = document.getElementById("btn_sign_out");
const btn_favs = document.getElementById("btn_favs");

const sign_up_form = document.getElementById("sign_up_form");
const sign_in_form = document.getElementById("sign_in_form");

const sign_up = document.getElementById("sign_up");
const sign_in = document.getElementById("sign_in");

btn_sign_up.addEventListener('click', () => {
    sign_up.classList.toggle('show');
    sign_in.classList.remove('show');
});
btn_sign_in.addEventListener('click', () => {
    sign_in.classList.toggle('show');
    sign_up.classList.remove('show');
});
btn_sign_out.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href='index.html';
    });
});
btn_favs.addEventListener('click', () => {
    const loading = document.getElementById('loading');
    const best_sellers = document.getElementById('best_sellers');
    const list_container = document.getElementById('list');
    const favorites = document.getElementById('favorites');
    loading.style.display = "block";
    favorites.style.display = "flex";
    best_sellers.style.display = "none";
    list_container.style.display = "none";
    onAuthStateChanged(auth, async user => {
        if (user) {
            favorites.innerHTML = "";
            const q = query(collection(fs, "favorites"), where("uid", "==", user.uid));
            const querySnapshot = await getDocs(q);
            let section = document.createElement("section");
            let div =document.createElement("div");
            div.style.width='100%';
            //volver atras
            let back = document.createElement("button");
            back.innerHTML = "< BACK";
            back.onclick = () => {
                favorites.style.display = "none";
                const best_sellers = document.getElementById('best_sellers');
                best_sellers.style.display = "flex";
            };
            div.appendChild(back);
            //titulo
            let h2 = document.createElement("h2");
            h2.innerHTML = "Favorites";
            div.appendChild(h2);
            section.appendChild(div);
            querySnapshot.forEach((doc) => {
                let article = document.createElement("article");
                article.className = "book";
                //titulo
                let h4 = document.createElement("h4");
                h4.innerHTML = doc.data().title;
                article.appendChild(h4);
                //caratula
                let img = document.createElement("img");
                img.src = doc.data().image;
                article.appendChild(img);
                //semanas en lista
                let weeks = document.createElement("p");
                weeks.innerHTML = 'Weeks on list: ' + doc.data().weeks_on_list;
                article.appendChild(weeks);
                //descripcion
                let description = document.createElement("p");
                description.innerHTML = doc.data().description;
                article.appendChild(description);
                //ir a amazon
                let button = document.createElement("button");
                button.innerHTML = "BUY AT AMAZON";
                button.onclick = () => { window.location.href = doc.data().amazon_product_url };
                article.appendChild(button);
                section.appendChild(article);
            });
            favorites.appendChild(section);
            loading.style.display = "none";
        }
    });
});

sign_up_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById("email_sign_up").value;
    const password = document.getElementById("password_sign_up").value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            //console.log(userCredential)
            sign_up_form.reset();
            toggle_options();
            sign_up.classList.remove('show');
        })
        .catch(error => alert(error.message.replace('Firebase: ', '')));
});
sign_in_form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById("email_sign_in").value;
    const password = document.getElementById("password_sign_in").value;
    signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            //console.log(userCredential)
            sign_in_form.reset();
            toggle_options();
            sign_in.classList.remove('show');
        })
        .catch(error => alert(error.message.replace('Firebase: ', '')));
});

//funciones
function
loadList(list_name_encoded) {
    const list_container = document.getElementById('list');
    list_container.innerHTML = "";
    const list = new CustomFetch(api_url + 'current/' + list_name_encoded + '.json?api-key=' + api_key);
    list.beforeSend(() => {
        const loading = document.getElementById('loading');
        const best_sellers = document.getElementById('best_sellers');
        loading.style.display = "block";
        best_sellers.style.display = "none";
    });
    const fecth_list = list.fetch();
    fecth_list
        .then(res => res.json())
        .then(data => {
            const loading = document.getElementById('loading');
            loading.style.display = "none";
            list_container.style.display = "flex";
            let section = document.createElement("section");
            let div =document.createElement("div");
            div.style.width='100%';
            //volver atras
            let back = document.createElement("button");
            back.innerHTML = "< BACK";
            back.onclick = () => {
                list_container.style.display = "none";
                const best_sellers = document.getElementById('best_sellers');
                best_sellers.style.display = "flex";
            };
            div.appendChild(back);
            //titulo
            let h2 = document.createElement("h2");
            h2.innerHTML = data.results.list_name;
            div.appendChild(h2);
            section.appendChild(div);
            data.results.books.forEach(book => {
                let article = document.createElement("article");
                article.className = "book";
                //titulo
                let h4 = document.createElement("h4");
                h4.innerHTML = '#' + book.rank + ' ' + book.title;
                article.appendChild(h4);
                //caratula
                let img = document.createElement("img");
                img.src = book.book_image;
                article.appendChild(img);
                //semanas en lista
                let weeks = document.createElement("p");
                weeks.innerHTML = 'Weeks on list: ' + book.weeks_on_list;
                article.appendChild(weeks);
                //descripcion
                let description = document.createElement("p");
                description.innerHTML = book.description;
                article.appendChild(description);
                //ir a amazon
                let button = document.createElement("button");
                button.innerHTML = "BUY AT AMAZON";
                button.onclick = () => { window.location.href = book.amazon_product_url };
                article.appendChild(button);
                //añadir a favoritos
                onAuthStateChanged(auth, user => {
                    if (user) {
                        let button = document.createElement("button");
                        button.innerHTML = "ADD TO FAVORITES";
                        button.onclick = async() => {
                            const loading = document.getElementById('loading');
                            loading.style.display = "block";
                            const q = query(collection(fs, "favorites"), where("title", "==", book.title), where("uid", "==", user.uid));
                            const querySnapshot = await getDocs(q);
                            if (querySnapshot.docs.length == 0) {
                                await addDoc(collection(fs, "favorites"), {
                                    title: book.title,
                                    image: book.book_image,
                                    weeks_on_list: book.weeks_on_list,
                                    description: book.description,
                                    amazon_product_url: book.amazon_product_url,
                                    uid: user.uid,
                                });
                                loading.style.display = "none";
                            } else {
                                alert('Already added to favorities');
                                loading.style.display = "none";
                            }
                        };
                        article.appendChild(button);
                    }
                });
                section.appendChild(article);
            });
            list_container.appendChild(section);
        });
}

function toggle_options() {
    onAuthStateChanged(auth, user => {
        if (!user) {
            let elements = document.querySelectorAll('#no_user');
            elements.forEach(element => {
                element.classList.add('show');
            });
            elements = document.querySelectorAll('#with_user');
            elements.forEach(element => {
                element.classList.remove('show');
            });
        } else {
            let elements = document.querySelectorAll('#no_user');
            elements.forEach(element => {
                element.classList.remove('show');
            });
            elements = document.querySelectorAll('#with_user');
            elements.forEach(element => {
                element.classList.add('show');
            });
        }
    });
}

//fetch custom - simula el beforeSend de jquery ajax

class CustomFetch {

    constructor(url, init = {}) {
        this.url = url;
        this.init = init;
        this.promise = null;
        this.beforeSends = [];
    }

    /**
     * Runs the actual fetch call.
     * @return {Promise<Response>}
     */
    fetch() {
        this._runBeforeSends();
        this.promise = fetch(this.url, this.init);
        return this.promise;
    }

    /**
     * Runs all registered before-send functions
     */
    _runBeforeSends() {
        this.beforeSends.forEach(fn => fn(this));
        return this;
    }

    /**
     * Register a beforesend handler.
     * @param {function(url, init): void} fn
     */
    beforeSend(fn) {
        this.beforeSends.push(fn);
        return this;
    }
}