const resources = [
  {id:1,type:"livros",tag:"Livro",title:"Matemática — 7.ª Classe",description:"Manual de apoio escolar",className:"7.ª Classe",subject:"Matemática",image:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80",action:"Ler agora"},
  {id:2,type:"exames",tag:"Exame",title:"Exame Nacional — 12.ª Classe",description:"Modelo de exame anterior",className:"12.ª Classe",subject:"Português",image:"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=700&q=80",action:"Ver documento"},
  {id:3,type:"exercicios",tag:"Exercício",title:"Exercícios de Física",description:"Pratica e testa os teus conhecimentos",className:"10.ª Classe",subject:"Física",image:"https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=700&q=80",action:"Resolver agora"},
  {id:4,type:"cursos",tag:"Curso",title:"Informática Básica",description:"Introdução ao mundo digital",className:"Todas as classes",subject:"TICs",image:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",action:"Acessar curso"},
  {id:5,type:"videos",tag:"Vídeo",title:"Curiosidades do Universo",description:"Descobre os mistérios do espaço",className:"Todas as classes",subject:"Ciências",image:"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=700&q=80",action:"Assistir agora"},
  {id:6,type:"livros",tag:"Livro",title:"Biologia — 9.ª Classe",description:"Introdução às ciências da vida",className:"9.ª Classe",subject:"Biologia",image:"https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=700&q=80",action:"Ler agora"},
  {id:7,type:"exercicios",tag:"Exercício",title:"Problemas de Matemática",description:"Exercícios para praticar",className:"8.ª Classe",subject:"Matemática",image:"https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=700&q=80",action:"Resolver agora"}
];

const grid = document.getElementById("resourceGrid");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const classFilter = document.getElementById("classFilter");
const sectionTitle = document.getElementById("sectionTitle");
let activeCategory = "";

const titles = {livros:"Livros",exames:"Exames",exercicios:"Exercícios",cursos:"Cursos",videos:"Vídeos de curiosidades"};

function renderResources() {
  const term = searchInput.value.trim().toLocaleLowerCase("pt");
  const selectedClass = classFilter.value;
  const filtered = resources.filter(item => {
    const matchesCategory = !activeCategory || item.type === activeCategory;
    const searchable = `${item.title} ${item.description} ${item.subject} ${item.className}`.toLocaleLowerCase("pt");
    const matchesText = !term || searchable.includes(term);
    const matchesClass = !selectedClass || item.className === selectedClass || item.className === "Todas as classes";
    return matchesCategory && matchesText && matchesClass;
  });

  grid.innerHTML = filtered.map(item => `
    <article class="resource-card">
      <div class="resource-image">
        <img src="${item.image}" alt="" loading="lazy">
        <span class="resource-tag">${item.tag}</span>
      </div>
      <div class="resource-info">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <button class="resource-action" data-resource="${item.id}">${item.action} →</button>
      </div>
    </article>`).join("");

  emptyState.hidden = filtered.length !== 0;
  sectionTitle.textContent = activeCategory ? titles[activeCategory] : (term || selectedClass ? "Resultados da pesquisa" : "Destaques");
}



function setCategory(category) {
  activeCategory = category || "";
  renderResources();
  document.getElementById("biblioteca").scrollIntoView({behavior:"smooth",block:"start"});
}

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => setCategory(button.dataset.filter));
});
document.querySelectorAll("[data-category]").forEach(link => {
  link.addEventListener("click", () => {
    setCategory(link.dataset.category);
    document.getElementById("mainNav").classList.remove("open");
    document.getElementById("menuToggle").setAttribute("aria-expanded","false");
  });
});
document.getElementById("showAll").addEventListener("click", () => {
  activeCategory = "";
  searchInput.value = "";
  classFilter.value = "";
  renderResources();
});
document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  activeCategory = "";
  renderResources();
  document.getElementById("biblioteca").scrollIntoView({behavior:"smooth"});
});
searchInput.addEventListener("input", renderResources);
classFilter.addEventListener("change", renderResources);

grid.addEventListener("click", event => {
  const button = event.target.closest("[data-resource]");
  if (!button) return;
  const item = resources.find(resource => resource.id === Number(button.dataset.resource));
  alert(`"${item.title}"\n\nEste é um conteúdo demonstrativo. Quando o backend estiver ligado, aqui será aberto o documento, exercício, curso ou vídeo correspondente.`);
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const opened = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(opened));
});
const loginDialog = document.getElementById("loginDialog");
const closeLogin = document.getElementById("closeLogin");

if (closeLogin && loginDialog) {
    closeLogin.addEventListener("click", () => loginDialog.close());
}
document.getElementById("closeLogin").addEventListener("click", () => document.getElementById("loginDialog").close());
document.getElementById("year").textContent = new Date().getFullYear();
renderResources();





/* =================================
   SISTEMA DE CADASTRO DO ALUNO
================================= */


/* =================================
   SISTEMA DE CADASTRO E LOGIN
================================= */

const API_URL = "https://biblioteca-cac-jr-7.onrender.com";

// Ecrãs
const registrationScreen = document.getElementById("registrationScreen");
const loginScreen = document.getElementById("loginScreen");

// Formulários
const registrationForm = document.getElementById("studentRegistrationForm");
const loginForm = document.getElementById("studentLoginForm");

// Mensagens de erro
const registrationError = document.getElementById("registrationError");
const loginError = document.getElementById("loginError");

// Botões de navegação
const showLoginButton = document.getElementById("showLogin");
const showRegistrationButton = document.getElementById("showRegistration");


/* MOSTRAR BIBLIOTECA */

let currentStudent = JSON.parse(
    localStorage.getItem("bibliotecaStudent") || "null"
);

function showLibrary(student) {

    if (!student) {
        console.error("Dados do aluno não recebidos!");
        alert("Não foi possível carregar os dados do aluno.");
        return;
    }

    currentStudent = student;

    localStorage.setItem(
        "bibliotecaStudent",
        JSON.stringify(student)
    );

    registrationScreen.classList.add("is-hidden");
    loginScreen.classList.add("is-hidden");

    document.getElementById("biblioteca").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// RECUPERAR A BIBLIOTECA AO VOLTAR DO PERFIL
const params = new URLSearchParams(window.location.search);

if (params.get("pagina") === "biblioteca" && currentStudent) {
    showLibrary(currentStudent);
}

// RECUPERAR SESSÃO DO ALUNO AO ABRIR A PÁGINA
document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);

    if (params.get("pagina") === "biblioteca" && currentStudent) {
        showLibrary(currentStudent);
    }

});

// ABRIR MEU PERFIL
// ABRIR PÁGINA MEU PERFIL
const profileButton = document.getElementById("profileButton");

if (profileButton) {
    profileButton.addEventListener("click", function() {

        if (!currentStudent) {
            alert("Primeiro, entra na tua conta.");
            loginScreen.classList.remove("is-hidden");
            registrationScreen.classList.add("is-hidden");
            return;
        }

        // Guardar os dados do aluno para a página de perfil
        localStorage.setItem(
            "bibliotecaStudent",
            JSON.stringify(currentStudent)
        );

        // Abrir página separada
        window.location.href = "perfil.html";
    });
}
/* ALTERNAR ENTRE CADASTRO E LOGIN */

showLoginButton.addEventListener("click", function() {
    registrationScreen.classList.add("is-hidden");
    loginScreen.classList.remove("is-hidden");
});

showRegistrationButton.addEventListener("click", function() {
    loginScreen.classList.add("is-hidden");
    registrationScreen.classList.remove("is-hidden");
});


/* =================================
   REGISTAR ALUNO
================================= */

registrationForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const student = {
        nome: document.getElementById("studentFirstName").value.trim(),
        apelido: document.getElementById("studentSurname").value.trim(),
        idade: Number(document.getElementById("studentAge").value),
        classe: document.getElementById("studentClass").value,
        email: document.getElementById("studentEmail").value.trim(),
        password: document.getElementById("studentPassword").value,
        confirmPassword: document.getElementById("confirmPassword").value
    };

    
let error = "";

const nomeValido = /^[\p{L}][\p{L}\s'-]{1,49}$/u;
const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const senhaForte = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

student.email = student.email.toLowerCase();

if (!nomeValido.test(student.nome)) {
    error = "Introduz um nome válido, com pelo menos 2 letras.";
} else if (!nomeValido.test(student.apelido)) {
    error = "Introduz um apelido válido.";
} else if (
    !Number.isInteger(student.idade) ||
    student.idade < 10 ||
    student.idade > 25
) {
    error = "Introduz uma idade válida.";
} else if (!student.classe) {
    error = "Seleciona a tua classe.";
} else if (!emailValido.test(student.email)) {
    error = "Introduz um email válido.";
} else if (!senhaForte.test(student.password)) {
    error = "A senha deve ter pelo menos 10 caracteres, uma maiúscula, uma minúscula, um número e um símbolo.";
} else if (student.password !== student.confirmPassword) {
    error = "As senhas não coincidem.";
}

    if (error) {
        registrationError.textContent = error;
        registrationError.hidden = false;
        return;
    }

    try {

        registrationError.hidden = true;

        const response = await fetch(
            `${API_URL}/api/users/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(student)
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Erro ao criar conta.");
        }

        alert("Conta criada com sucesso!");

// Guardar token JWT
localStorage.setItem("bibliotecaToken", data.token);

// Guardar dados do aluno
localStorage.setItem(
    "bibliotecaStudent",
    JSON.stringify(data.student)
);

registrationForm.reset();

showLibrary(data.student);

    } catch (error) {

        registrationError.textContent =
            error.message.includes("Failed to fetch")
                ? "Não foi possível contactar o servidor."
                : error.message;

        registrationError.hidden = false;

        console.error("Erro no cadastro:", error);
    }

});


/* =================================
   ENTRAR NA CONTA
================================= */

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {

        loginError.hidden = true;

        const response = await fetch(
            `${API_URL}/api/users/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Não foi possível entrar.");
        }

        alert("Bem-vindo à Biblioteca Virtual!");

// Guardar token de autenticação
localStorage.setItem("bibliotecaToken", data.token);

// Guardar dados do aluno
localStorage.setItem(
    "bibliotecaStudent",
    JSON.stringify(data.student)
);

loginForm.reset();

showLibrary(data.student);
    } catch (error) {

        loginError.textContent =
            error.message.includes("Failed to fetch")
                ? "Não foi possível contactar o servidor."
                : error.message;

        loginError.hidden = false;

        console.error("Erro no login:", error);
    }

});

     
