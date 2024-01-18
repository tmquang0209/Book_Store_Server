const fs = require("fs");

const provincesController = {
    getFull: (req, res) => {
        let provinces = fs.readFileSync("./data/data_provinces.txt", { encoding: "utf-8" });
        provinces = JSON.parse(provinces);
        res.json(provinces);
    },
};

module.exports = provincesController;
