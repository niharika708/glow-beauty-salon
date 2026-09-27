const SUPABASE_URL = "https://gyytffecbqwtgbkbnijd.supabase.co";
const SUPABASE_KEY = "sb_publishable_oxaP8tUrVZt14o3jeijvfQ_ZxSu8Fyq";

const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.querySelector("#login-email").value;
    const password = document.querySelector("#login-password").value;

    const response = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        document.querySelector("#login-message").textContent =
            "Login failed. Check your email and password.";
        return;
    }

    localStorage.setItem("access_token", data.access_token);

    document.querySelector("#login-section").style.display = "none";
    document.querySelector("#dashboard-section").style.display = "block";

    document.querySelector("#login-message").textContent = "";

    loadEnquiries(data.access_token);
    
});

document.addEventListener("change", async function(event) {
    if (!event.target.classList.contains("status-select")) {
        return;
    }

    const enquiryId = event.target.dataset.id;
    const newStatus = event.target.value;
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/enquiries?id=eq.${enquiryId}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${accessToken}`,
                "Prefer": "return=minimal"
            },
            body: JSON.stringify({
                status: newStatus
            })
        }
    );

    if (response.ok) {
        loadEnquiries(accessToken);
    } else {
        const errorText = await response.text();
        console.log("Status update error:", response.status);
        console.log("Supabase response:", errorText);
        alert("Could not update status.");
    }
});
async function loadEnquiries(accessToken) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/enquiries?select=*`,
        {
            method: "GET",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        document.querySelector("#enquiries").innerHTML =
            "Could not load enquiries.";
        return;
    }

    const enquiries = await response.json();

const pendingCount = enquiries.filter(
    enquiry => (enquiry.status || "Pending").toLowerCase() === "pending"
).length;

const completedCount = enquiries.filter(
    enquiry => enquiry.status === "Completed"
).length;

document.querySelector("#enquiry-count").textContent = enquiries.length;
document.querySelector("#pending-count").textContent = pendingCount;
document.querySelector("#completed-count").textContent = completedCount;

    if (enquiries.length === 0) {
        document.querySelector("#enquiries").innerHTML =
            "No enquiries yet.";
        return;
    }

    document.querySelector("#enquiries").innerHTML =
        enquiries.map(function(enquiry) {
            return `
    <div>
        <h3>${enquiry.name}</h3>
        <p>Email: ${enquiry.email}</p>
        <p>Phone: ${enquiry.phone}</p>
        <p>Service: ${enquiry.service}</p>
        <p>Date: ${enquiry.preferred_date}</p>
        <p>Received: ${new Date(enquiry.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
})}</p>
        <p><strong>Status:</strong></p>

<select class="status-select" data-id="${enquiry.id}">
    <option value="Pending" ${(enquiry.status || "Pending") === "Pending" ? "selected" : ""}>
        Pending
    </option>

    <option value="Contacted" ${enquiry.status === "Contacted" ? "selected" : ""}>
        Contacted
    </option>

    <option value="Completed" ${enquiry.status === "Completed" ? "selected" : ""}>
        Completed
    </option>
</select>
<button class="delete-btn" data-id="${enquiry.id}">
    Delete Enquiry
</button>
    </div>
`;
        }).join("");
}
document.addEventListener("click", async function(event) {
    if (!event.target.classList.contains("delete-btn")) {
        return;
    }

    const confirmed = confirm("Are you sure you want to delete this enquiry?");

    if (!confirmed) {
        return;
    }

    const enquiryId = event.target.dataset.id;
    const accessToken = localStorage.getItem("access_token");

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/enquiries?id=eq.${enquiryId}`,
        {
            method: "DELETE",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
    const errorText = await response.text();

    console.log("Dashboard error:", response.status);
    console.log("Supabase response:", errorText);

    document.querySelector("#enquiries").innerHTML =
        "Could not load enquiries.";
    return;
}
});
const savedToken = localStorage.getItem("access_token");

if (savedToken) {
    document.querySelector("#login-section").style.display = "none";
    document.querySelector("#dashboard-section").style.display = "block";

    loadEnquiries(savedToken);
}
document.querySelector("#logout-btn").addEventListener("click", function() {
    localStorage.removeItem("access_token");

    document.querySelector("#dashboard-section").style.display = "none";
    document.querySelector("#login-section").style.display = "block";
});
function filterEnquiries() {
    const searchText = document.querySelector("#search-enquiries").value.toLowerCase();
    const selectedStatus = document.querySelector("#status-filter").value;

    const enquiryCards = document.querySelectorAll(".enquiry-container > div");

    enquiryCards.forEach(function(card) {
        const customerName = card.querySelector("h3").textContent.toLowerCase();
        const status = card.querySelector(".status-select").value;

        const matchesName = customerName.includes(searchText);
        const matchesStatus =
            selectedStatus === "All" || status === selectedStatus;

        if (matchesName && matchesStatus) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
}

document.querySelector("#search-enquiries").addEventListener(
    "input",
    filterEnquiries
);

document.querySelector("#clear-filters").addEventListener("click", function() {
    document.querySelector("#search-enquiries").value = "";
    document.querySelector("#status-filter").value = "All";

    filterEnquiries();
});