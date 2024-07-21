exports.db_controller = {

    async sql_execute(sql_string) {
        const { db_connection } = require('../db_connection');
        const connection = await db_connection.Create_Connection();
        const [rows] = await connection.execute(sql_string);
        connection.end();
        return rows;
    },

    async get_all_preferences() {
        try {
            let data = await this.sql_execute("SELECT * FROM tbl_57_preferences");
            return data;
        } catch (error) {
            return 400;
        }
    },

    async add_preference(data) {

        try {
            let result = await this.sql_execute("SELECT COUNT(*) AS count FROM tbl_57_preferences");
            if (result[0].count > 12) {
                return 403;
            }
            let date = await this.sql_execute(`SELECT DATEDIFF("${data.end_date}", "${data.start_date}") AS difference`);
            result = await this.sql_execute(`SELECT id FROM tbl_57_users WHERE access_key = "${data.access_key}"`);
            if ((result[0].id > 0) && (date[0].difference >= 0 && date[0].difference <= 7)) {
                let sqlString = `INSERT INTO tbl_57_preferences 
            (user_id, vacation_type, destination, start_date, end_date, submission_time) 
            VALUES (
                ${result[0].id},
                "${data.vacation_type}",
                "${data.destination}",
                "${data.start_date}",
                "${data.end_date}",
                Now())`;
                await this.sql_execute(sqlString);
                return 201;
            }

            return 403;
        } catch (error) {
            return 400;
        }
    },

    async vacation() {
        try {
            let data = await this.get_all_preferences();
            if (data != 400) {
                let result_array = [];
                let vacation_type_array = [];
                let vacation_type_sum = [0, 0, 0, 0, 0];
                let destination_array = [];
                let destination_sum = [0, 0, 0, 0, 0];
                for (let i in data) {
                    result_array.push([i, data[i]]);
                    vacation_type_array.push(data[i].vacation_type);
                    destination_array.push(data[i].destination);
                }
                let answer = { vacation_type: "", destination: "", start_date: "", end_date: "" };
                if (result_array.length < 5) {
                    return { message: "Not enaugh information" };
                } else {
                    for (let i = 0; i < 5; i++) {
                        for (let n = 0; n < 5; n++) {
                            if (data[i].vacation_type = vacation_type_array[n]) {
                                vacation_type_sum[n] += 1;
                            }
                            if (data[i].destination = destination_array[n]) {
                                destination_sum[n] += 1;
                            }
                        }
                    }
                    let result = await this.sql_execute("SELECT * FROM tbl_57_preferences WHERE submission_time = (SELECT MIN(submission_time) FROM tbl_57_preferences)");
                    let dates = await this.sql_execute("SELECT MAX(start_date) as start, MIN(end_date) as end, datediff(MAX(end_date), MIN(start_date)) as diff FROM tbl_57_preferences");
                    let max_vacation = vacation_type_sum.indexOf(Math.max(vacation_type_sum));
                    let max_destination = destination_sum.indexOf(Math.max(destination_sum));
                    if (vacation_type_sum[max_vacation] = 1) {
                        answer.vacation_type = result[0].vacation_type;
                    } else {
                        answer.vacation_type = vacation_type_array[max_vacation];
                    }
                    if (destination_sum[max_destination] = 1) {
                        answer.destination = result[0].destination;
                    } else {
                        answer.destination = destination_array[max_destination];
                    }
                    if (dates[0].diff < 14) {
                        answer.start_date = dates[0].start;
                        answer.end_date = dates[0].end;
                    } else {
                        answer.start_date = result[0].start_date;
                        answer.end_date = result[0].end_date;
                    }
                }
                return answer;
            }
            return 400;
        } catch (error) {
            return 400;
        }
    },

    async create_user(data) {
        try {
            let sqlString = `INSERT INTO tbl_57_users 
            (user_name, password, access_key) 
            VALUES (
                "${data.user_name}",
                "${data.password}",
                SHA2("${data.user_name}", 256)
            )`;
            await this.sql_execute(sqlString);
            return 201;
        } catch (error) {
            return 400;
        }
    },

    async login(data) {
        try {
            let sqlString = `SELECT access_key FROM tbl_57_users WHERE user_name = "${data.user_name}" AND password = "${data.password}"`;
            let result = await this.sql_execute(sqlString);
            if (result.length > 0) {
                return result[0].access_key;
            }
            return 401;
        } catch (error) {
            return 401;
        }
    },

    async change_preference(data) {
        try {
            result = await this.sql_execute(`SELECT id FROM tbl_57_users WHERE access_key = "${data.access_key}"`);
            if (result[0].id > 0) {
                let sqlString = `UPDATE tbl_57_preferences 
                SET vacation_type = "${data.vacation_type}", 
                destination = "${data.destination}", 
                start_date = "${data.start_date}", 
                end_date = "${data.end_date}", 
                submission_time = Now()
                WHERE user_id = ${result[0].id}`;
                await this.sql_execute(sqlString);
                return 200;
            }
            return 403;
        } catch (error) {
            return 403;
        }

    }
};