// Five companies
const companies = [
    "Boboy Sari-Sari Store",
    "Web Company",
    "Buy and Sell Fullcharge E-Bike",
    "Upvote",
    "Smart Trading"
];

// Save employee data in the browser
const STORAGE_KEY = "worktrack_employee_data";

let employees = [];

try {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    employees = Array.isArray(savedData) ? savedData : [];
} catch (error) {
    employees = [];
}

// Set today's date using the local time
function getToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const dateInput = document.getElementById("attendanceDate");
dateInput.value = getToday();

function selectedDate() {
    return dateInput.value || getToday();
}

// Escape text before displaying employee information
function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Save changes
function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(employees)
    );
}

// Give an employee a default status for a date
function getStatus(employee) {
    if (!employee.attendance) {
        employee.attendance = {};
    }

    return employee.attendance[selectedDate()] || "Present";
}

// Add the five companies to the dropdown menus
function loadCompanies() {
    const companySelect = document.getElementById("company");
    const filterSelect = document.getElementById("companyFilter");

    companySelect.innerHTML =
        '<option value="">Select Company</option>';

    filterSelect.innerHTML =
        '<option value="All">All Companies</option>';

    companies.forEach(company => {
        const option1 = document.createElement("option");
        option1.value = company;
        option1.textContent = company;
        companySelect.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = company;
        option2.textContent = company;
        filterSelect.appendChild(option2);
    });
}

// Open the employee form
function openForm(id = "") {
    document.getElementById("employeeForm").reset();
    document.getElementById("employeeId").value = id;

    const employee = employees.find(item => item.id === id);

    document.getElementById("formTitle").textContent =
        employee ? "Edit Employee" : "Add Employee";

    if (employee) {
        document.getElementById("name").value = employee.name;
        document.getElementById("email").value = employee.email;
        document.getElementById("phone").value = employee.phone;
        document.getElementById("place").value = employee.place;
        document.getElementById("position").value =
            employee.position || "";
        document.getElementById("company").value = employee.company;
    }

    document.getElementById("employeeModal").style.display = "flex";
}

// Close the form
function closeForm() {
    document.getElementById("employeeModal").style.display = "none";
}

// Add or update employee details
document.getElementById("employeeForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        const id = document.getElementById("employeeId").value;

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const place = document.getElementById("place").value.trim();
        const position = document.getElementById("position").value.trim();
        const company = document.getElementById("company").value;

        if (!name || !email || !phone || !place || !company) {
            alert("Please complete all required fields.");
            return;
        }

        if (id) {
            // Update an existing employee
            const employee = employees.find(item => item.id === id);

            if (employee) {
                employee.name = name;
                employee.email = email;
                employee.phone = phone;
                employee.place = place;
                employee.position = position;
                employee.company = company;
            }

            alert("Employee details updated successfully!");
        } else {
            // Create a new employee
            const newEmployee = {
                id: Date.now().toString(),
                name: name,
                email: email,
                phone: phone,
                place: place,
                position: position,
                company: company,
                attendance: {}
            };

            employees.push(newEmployee);

            alert("Employee added successfully!");
        }

        saveData();
        closeForm();
        render();
    }
);

// Change attendance status
function changeStatus(id, status) {
    const employee = employees.find(item => item.id === id);

    if (!employee) return;

    if (!employee.attendance) {
        employee.attendance = {};
    }

    employee.attendance[selectedDate()] = status;

    saveData();
    render();
}

// Delete an employee
function deleteEmployee(id) {
    const employee = employees.find(item => item.id === id);

    if (!employee) return;

    const confirmed = confirm(
        "Are you sure you want to delete " + employee.name + "?"
    );

    if (!confirmed) return;

    employees = employees.filter(item => item.id !== id);

    saveData();
    render();

    alert("Employee deleted.");
}

// Find employees based on the search and filters
function getFilteredEmployees() {
    const search = document
        .getElementById("searchInput")
        .value.toLowerCase()
        .trim();

    const companyFilter = document.getElementById("companyFilter").value;
    const statusFilter = document.getElementById("statusFilter").value;

    return employees.filter(employee => {
        const searchable = [
            employee.name,
            employee.email,
            employee.phone,
            employee.place,
            employee.position,
            employee.company
        ].join(" ").toLowerCase();

        const matchesSearch = searchable.includes(search);

        const matchesCompany =
            companyFilter === "All" ||
            employee.company === companyFilter;

        const matchesStatus =
            statusFilter === "All" ||
            getStatus(employee) === statusFilter;

        return matchesSearch && matchesCompany && matchesStatus;
    });
}

// Show dashboard numbers
function renderStats() {
    const companyFilter = document.getElementById("companyFilter").value;

    const list = employees.filter(employee =>
        companyFilter === "All" ||
        employee.company === companyFilter
    );

    let present = 0;
    let absent = 0;
    let leave = 0;

    list.forEach(employee => {
        const status = getStatus(employee);

        if (status === "Present") present++;
        if (status === "Absent") absent++;
        if (status === "On Leave") leave++;
    });

    document.getElementById("presentCount").textContent = present;
    document.getElementById("absentCount").textContent = absent;
    document.getElementById("leaveCount").textContent = leave;
    document.getElementById("totalCount").textContent = list.length;
}

// Show employee list
function renderEmployees() {
    const table = document.getElementById("employeeTable");
    const emptyMessage = document.getElementById("emptyMessage");

    const list = getFilteredEmployees();

    table.innerHTML = "";

    emptyMessage.style.display = list.length === 0 ? "block" : "none";

    list.forEach(employee => {
        const status = getStatus(employee);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>${safeText(employee.name)}</strong>
            </td>

            <td>${safeText(employee.company)}</td>

            <td>${safeText(employee.email)}</td>

            <td>${safeText(employee.phone)}</td>

            <td>${safeText(employee.place)}</td>

            <td>${safeText(employee.position || "-")}</td>

            <td>
                <select class="status-select status-${status.replace(/\s/g, "-")}"
                    aria-label="Attendance status for ${safeText(employee.name)}">
                    <option value="Present"
                        ${status === "Present" ? "selected" : ""}>
                        Present
                    </option>

                    <option value="Absent"
                        ${status === "Absent" ? "selected" : ""}>
                        Absent
                    </option>

                    <option value="On Leave"
                        ${status === "On Leave" ? "selected" : ""}>
                        On Leave
                    </option>
                </select>
            </td>

            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        // Attendance status dropdown
        row.querySelector(".status-select").addEventListener(
            "change",
            function() {
                changeStatus(employee.id, this.value);
            }
        );

        // Edit employee
        row.querySelector(".edit-btn").addEventListener(
            "click",
            function() {
                openForm(employee.id);
            }
        );

        // Delete employee
        row.querySelector(".delete-btn").addEventListener(
            "click",
            function() {
                deleteEmployee(employee.id);
            }
        );

        table.appendChild(row);
    });
}

// Show company employee totals
function renderCompanies() {
    const summary = document.getElementById("companySummary");

    summary.innerHTML = "";

    companies.forEach(company => {
        const count = employees.filter(
            employee => employee.company === company
        ).length;

        const row = document.createElement("div");
        row.className = "company-row";

        row.innerHTML = `
            <span>${safeText(company)}</span>
            <p>${count} employee${count === 1 ? "" : "s"}</p>
        `;

        summary.appendChild(row);
    });
}

// Show attendance records for the selected date
function renderAttendance() {
    const table = document.getElementById("attendanceTable");

    table.innerHTML = "";

    const companyFilter = document.getElementById("companyFilter").value;

    const list = employees.filter(employee =>
        companyFilter === "All" ||
        employee.company === companyFilter
    );

    list.forEach(employee => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${safeText(employee.name)}</td>
            <td>${safeText(employee.company)}</td>
            <td>${safeText(selectedDate())}</td>
            <td>${safeText(getStatus(employee))}</td>
        `;

        table.appendChild(row);
    });
}

// Refresh all website information
function render() {
    renderStats();
    renderEmployees();
    renderCompanies();
    renderAttendance();
}

// Switch between website sections
function showSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Export attendance records as a CSV file
function exportReport() {
    const headers = [
        "Employee Name",
        "Gmail",
        "Phone Number",
        "Place",
        "Position",
        "Company",
        "Date",
        "Attendance"
    ];

    const rows = [headers];

    const companyFilter = document.getElementById("companyFilter").value;

    employees
        .filter(employee =>
            companyFilter === "All" ||
            employee.company === companyFilter
        )
        .forEach(employee => {
            rows.push([
                employee.name,
                employee.email,
                employee.phone,
                employee.place,
                employee.position || "",
                employee.company,
                selectedDate(),
                getStatus(employee)
            ]);
        });

    const csv = rows.map(row =>
        row.map(value =>
            '"' + String(value ?? "").replace(/"/g, '""') + '"'
        ).join(",")
    ).join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "attendance-report-" + selectedDate() + ".csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

// Update attendance when the date changes
dateInput.addEventListener("change", render);

// Add an export button to the header
const exportButton = document.createElement("button");

exportButton.textContent = "Export Report";
exportButton.style.marginLeft = "8px";
exportButton.addEventListener("click", exportReport);

document.querySelector(".header").appendChild(exportButton);

// Start the system with an empty employee list
loadCompanies();
render();