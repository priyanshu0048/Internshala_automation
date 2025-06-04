const pup = require("puppeteer");
let { id, pass } = require("./secret");
let tab;
let dataFile = require("./data");

async function main() {
    let browser = await pup.launch({
        headless: false,
        defaultViewport: false,
        args: ["--start-maximized"]
    });

    let pages = await browser.pages();
    tab = pages[0];
    await tab.goto("https://internshala.com/");
    await tab.click("button.login-cta");
    await tab.type("#modal_email", id);
    await tab.type("#modal_password", pass);
    await tab.click("#modal_login_submit");
    await tab.waitForNavigation({ waitUntil: "networkidle2" });
    await new Promise(() => {});

    await tab.click(".nav-link.dropdown-toggle.profile_container .is_icon_header.ic-24-filled-down-arrow");
    let profile_options = await tab.$$(".profile_options a");
    let app_urls = [];

    for (let i = 0; i < 11; i++) {
        let url = await tab.evaluate(ele => ele.getAttribute("href"), profile_options[i]);
        app_urls.push(url);
    }

    await tab.goto("https://internshala.com" + app_urls[1]);

    await tab.waitForSelector("#graduation-tab .ic-16-plus", { visible: true });
    await tab.click("#graduation-tab .ic-16-plus");
    await graduation(dataFile[0]);

    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");

    await training(dataFile[0]);

    await tab.waitForSelector(".next-button", { visible: true });
    await tab.click(".next-button");

    await tab.waitForSelector(".btn.btn-secondary.skip.skip-button", { visible: true });
    await tab.click(".btn.btn-secondary.skip.skip-button");

    await workSample(dataFile[0]);

    await tab.waitForSelector("#save_work_samples", { visible: true });
    await tab.click("#save_work_samples");

    await application(dataFile[0]);

    // Infinite wait to keep browser open
    console.log("✅ Automation completed. The browser will remain open. Press Ctrl + C to stop the script.");
    await new Promise(() => {});
}

async function graduation(data) {
    await tab.click("#degree_completion_status_pursuing");
    await tab.type("#college", data["College"]);
    await tab.click("#start_year_chosen");
    await tab.click(".active-result[data-option-array-index='5']");
    await tab.click("#end_year_chosen");
    await tab.click("#end_year_chosen .active-result[data-option-array-index='6']");
    await tab.type("#degree", data["Degree"]);
    await tab.type("#stream", data["Stream"]);
    await tab.type("#performance-college", data["Percentage"]);
    await tab.click("#college-submit");
}

async function training(data) {
    await tab.click(".experiences-tabs[data-target='#training-modal'] .ic-16-plus");
    await tab.type("#other_experiences_course", data["Training"]);
    await tab.type("#other_experiences_organization", data["Organization"]);
    await tab.click("#other_experiences_location_type_label");
    await tab.click("#other_experiences_start_date");

    let date = await tab.$$(".ui-state-default[href='#']");
    await date[0].click();
    await tab.click("#other_experiences_is_on_going");
    await tab.type("#other_experiences_training_description", data["description"]);
    await tab.click("#training-submit");
}

async function workSample(data) {
    await tab.type("#other_portfolio_link", data["link"]);
}

async function application(data) {
    await tab.goto("https://internshala.com/the-grand-summer-internship-fair");
    await tab.click(".btn.btn-primary.campaign-btn.view_internship");
    await new Promise(resolve => setTimeout(resolve, 2000));

    let details = await tab.$$(".view_detail_button");
    let detailUrl = [];
    for (let i = 0; i < 3; i++) {
        let url = await tab.evaluate(ele => ele.getAttribute("href"), details[i]);
        detailUrl.push(url);
    }

    for (let i of detailUrl) {
        await apply(i, data);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function apply(url, data) {
    await tab.goto("https://internshala.com" + url);
    await tab.click(".btn.btn-large");
    await tab.click("#application_button");
    let ans = await tab.$$(".textarea.form-control");

    if (ans[0]) {
        await ans[0].type(data["hiringReason"]);
    }
    if (ans[1]) {
        await ans[1].type(data["availability"]);
    }
}

main(); 

 
