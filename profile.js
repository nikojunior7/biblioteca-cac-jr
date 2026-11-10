
const STORAGE_KEY = "bibliotecaStudent";
const TOKEN_KEY = "bibliotecaToken";

const API_URL = "https://biblioteca-cac-jr-7.onrender.com";

async function loadStudentProfile() {
    const token = localStorage.getItem(TOKEN_KEY);
    const studentData = localStorage.getItem(STORAGE_KEY);

    if (!token || !studentData) {
        alert("A tua sessão terminou. Entra novamente.");
        window.location.href = "index.html";
        return;
    }

    try {
        const student = JSON.parse(studentData);

        if (!student || !student.id) {
            throw new Error("Identificação do aluno inválida.");
        }

        const response = await fetch(
            `${API_URL}/api/users/${student.id}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error("SESSION_EXPIRED");
            }

            throw new Error(
                data.message || "Não foi possível carregar o perfil."
            );
        }

        const aluno = data.user;

        if (!aluno || !aluno.nome || !aluno.email) {
            throw new Error("Dados do perfil incompletos.");
        }

        // Atualizar dados guardados
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(aluno)
        );

        // Mostrar dados do aluno
        document.getElementById("profileFullName").textContent =
            `${aluno.nome} ${aluno.apelido || ""}`;

        document.getElementById("profileName").textContent =
            aluno.nome || "---";

        document.getElementById("profileSurname").textContent =
            aluno.apelido || "---";

        document.getElementById("profileAge").textContent =
            aluno.idade ? aluno.idade + " anos" : "---";

        document.getElementById("profileClass").textContent =
            aluno.classe || "---";

        document.getElementById("profileEmail").textContent =
            aluno.email || "---";

        console.log("Perfil carregado com sucesso.");

    } catch (error) {
        console.error("Erro ao carregar perfil:", error);

        if (error.message === "SESSION_EXPIRED") {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(STORAGE_KEY);

            alert("A tua sessão expirou. Entra novamente.");
            window.location.href = "index.html";
            return;
        }

        alert(error.message || "Erro ao carregar o perfil.");
    }
}

// Terminar sessão
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", function() {
        const confirmar = confirm(
            "Desejas terminar a sessão?"
        );

        if (!confirmar) return;

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);

        window.location.href = "index.html";
    });
}

// Carregar perfil
loadStudentProfile();
