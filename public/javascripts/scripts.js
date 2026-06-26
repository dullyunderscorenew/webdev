const topnav = document.getElementById("e1");
const sidenav = document.getElementById("e2");
const mainframe = document.getElementById("e3");

document.addEventListener("DOMContentLoaded", () => {
    topnav.addEventListener("click", (event) => {
        if (event.target.tagName == "BUTTON") {
            activate(event.target, 1);
        }
    });
    sidenav.addEventListener("click", (event) => {
        if (event.target.tagName == "BUTTON") {
            activate(event.target, 2);
        }
    });
    Array.from(document.querySelectorAll(".card .toggle"), el => {
        el.addEventListener("click", (event) => {
            activate(event.target, 3);
        });
    });
});

function activate(ele, type) {
    function remove_active(eles) {
        Array.from(eles, el => {
            el.classList.remove("active");
        });
    }
    if (type == 1) {
        var e2 = sidenav.querySelector("[id='" + ele.dataset.menu + "']");

        remove_active(topnav.querySelectorAll("button"));
        remove_active(sidenav.children);
        remove_active(document.querySelectorAll("[data-content]"));
        remove_active(document.querySelectorAll("section"));

        ele.classList.add("active");
        e2.classList.add("active");
        e2.querySelector("[data-content='" + ele.dataset.standard + "']").classList.add("active");
        document.getElementById(ele.dataset.menu + "-" + ele.dataset.standard).classList.add("active");
    } else if (type == 2) {
        remove_active(document.querySelectorAll("[data-content]"));
        remove_active(document.querySelectorAll("section"));

        ele.classList.add("active");
        document.getElementById(ele.parentElement.id + "-" + ele.dataset.content).classList.add("active");
    } else if (type == 3) {
        ele.closest(".card").classList.toggle("collapsed");
    }
}
