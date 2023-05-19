async function getInfos() {
    let jsonData

    await chrome.storage.local.get(["kenzieForm"]).then((result) => {
        if (result.kenzieForm) {
            const data = JSON.parse(result.kenzieForm)
            jsonData = data
        } else {
            jsonData = {}
        }
    })

    if (!jsonData) {
        return
    }

    const inputs = document.querySelectorAll("input")
    inputs.forEach(input => {
        input.value = jsonData[input.name] ? jsonData[input.name] : ""
    })
}

function saveInfos() {
    const saveButton = document.querySelector("#save-btn")
    const inputs = document.querySelectorAll("input")

    function handleBlur(e) {
        const jsonData = {}
        inputs.forEach(input => {
            jsonData[input.name] = input.value
        })
        chrome.storage.local.set({ kenzieForm: JSON.stringify(jsonData) })
    }

    inputs.forEach(input => {
        input.addEventListener("blur", handleBlur)
    })

    saveButton.addEventListener("click", async (e) => {
        e.preventDefault()
        const jsonData = {}
        inputs.forEach(input => {
            jsonData[input.name] = input.value
        })
        await chrome.storage.local.set({ kenzieForm: JSON.stringify(jsonData) })
    })
}

async function completeForm() {
    const saveButton = document.querySelector("#complete-btn")
    saveButton.addEventListener("click", async (e) => {
        e.preventDefault()
        const tab = await getCurrentTab()
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: injectInfo
        })
    })
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

function injectInfo() {
    function simulateInput(input, value) {
        const inputEvent = new Event('input', { bubbles: true })
        input.value = value
        input.dispatchEvent(inputEvent)
    }

    let jsonData

    const fields = ["name", "phone", "email-one", "email-two", "linkedin", "github", "turma"]

    chrome.storage.local.get(["kenzieForm"]).then((result) => {
        if (result.kenzieForm) {
            const data = JSON.parse(result.kenzieForm)
            jsonData = data
        }

        const inputs = document.querySelectorAll(".whsOnd")
        const inputList = [...inputs].slice(0, 7)

        inputList.forEach((input, index) => {
            simulateInput(input, jsonData[fields[index]])
        })
    })
}

await getInfos()
saveInfos()
completeForm()