import fs from 'fs';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import FormData from 'form-data';

(async() => {
    const companies = [];
    const x = 10000; // Number of companies to parse
    const [cookies, token] = await axios.get('https://jobs.dou.ua/companies/')
    .then(data => {
        let cookies = data.headers['set-cookie'].join().split(';')[0];
        let token = new JSDOM(data.data).window.document.querySelector('input[name="csrfmiddlewaretoken"]').value;
        return [cookies, token];
    });

    for (let count = 0; count < x; count+=20) {
        const formData = new FormData();

        formData.append('csrfmiddlewaretoken', token);
        formData.append('count', count);

        let dom = await axios.post(`https://jobs.dou.ua/companies/xhr-load/?`, formData,
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Referer': 'https://jobs.dou.ua/companies/',
                'cookie': cookies
            }
        })
        .then(({ data }) => new JSDOM(data.html));
        dom.window.document.querySelectorAll('.cn-a').forEach(e => companies.push(e.textContent));
        console.log(`Parsed ${Math.floor(count / x * 100)}%...`);
    }
    fs.writeFileSync('companies.json', JSON.stringify(companies, null, 2));
})();
