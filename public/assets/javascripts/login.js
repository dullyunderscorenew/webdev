document.getElementById('login-btn').onclick = async () => {
    event.preventDefault();
    const name = document.getElementById('nutzername').value;
    const pw = document.getElementById('passwort').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, pw })
        });

        if (response.ok) {
            window.location.href = '/index.html';
        } else {
            const data = await response.json();
            errorDiv.innerText = response.message || "Nutzername oder Passwort sind falsch!";
        }
    } catch (err) {
        errorDiv.innerText = "Nutzername oder Passwort sind falsch!";
    }
};