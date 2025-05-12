import student_data from "./data_student.json" with {type: "json"};
import subject_data from "./data_subject.json" with {type: "json"};
/** @type {{[student_name: string]: ({name: string, classnum: number}|null)[][]}} */
const StudentData = student_data
/** @type {{[subject_name: string]: {[classnum: number]: {students: string[], when: {day: number, start: number, time: number}[]}}}} */
const SubjectData = subject_data

/**
 * 
 * @param {{name: string, classnum: number}} subjectData 
 */
function subjectText(subjectData) {
    if(!subjectData) return "공강"
    return `${subjectData.name}<span style="font-weight: 300; font-size: 10pt;">#${subjectData.classnum}</span>`
}

/**
 * 
 * @param {Number} mode 0: 1명의 시간표, 1: 여러 명의 교집합
 * @param {[String]} target_students 학생 이름 Array
 */

function makeTable(mode, target_students) {    
    var TableHTML = `<table>\n<thead>\n<tr>
    <th>교시</th>
    <th>Mon</th>
    <th>Tue</th>
    <th>Wed</th>
    <th>Thu</th>
    <th>Fri</th>
    </tr>\n</thead>\n<tbody>`;
    var isCons = [false, false, false, false, false]
    for (var timeNum=1; timeNum<=9; timeNum++) {
        TableHTML += `\n<tr>\n<td class="timeTd">${timeNum}</td>\n`;
        for (var dayNum=0; dayNum<=4; dayNum++) {
            // 연구활동
            if(dayNum == 2 && 5 <= timeNum && timeNum <= 7) {
                if(timeNum == 5) TableHTML += "<td rowspan=3 class='subjectTd specialTd'>연구활동</td>"
                continue;
            }

            // 창체
            if(dayNum == 4 && timeNum == 5) {
                TableHTML += "<td class='subjectTd specialTd'>창체</td>"
                continue
            }
            // 연강
            if(isCons[dayNum]) {isCons[dayNum] = false; continue;}
            
            if(mode == 0) { // 0: target_students[0]와 같은 사람 찾기
                var thisdata = StudentData[target_students[0]][dayNum][timeNum]
                var intersect = []
                var subject_name = ""
                var td_class_name = ""
                if (thisdata == null) {
                    var subject_name = "공강"
                    intersect = new Array()
                    for (const student in StudentData)
                        if(StudentData[student][dayNum][timeNum] == null) intersect.push(student);
                    td_class_name = "emptyTd"
                }
                else {
                    subject_name = subjectText(thisdata)
                    intersect = SubjectData[thisdata.name][thisdata.classnum].students
                    if (StudentData[target_students[0]][dayNum][timeNum+1] && thisdata.name == StudentData[target_students[0]][dayNum][timeNum+1].name) isCons[dayNum] = true
                }
                TableHTML += `<td class='subjectTd ${td_class_name}' rowspan=${isCons[dayNum] ? 2 : 1}><div class="cell">
                    <div class="subject_name">${subject_name}</div>
                    <div class="intersect">${intersect.sort().join(", ")}</div>
                <div></td>`
            } else { // 1: target_students간 수업 겹치는지 판별하기
                var thisdata = StudentData[target_students[0]][dayNum][timeNum]
                var subject_name = subjectText(thisdata)
                var flag = true
                for(const index in target_students) {
                    if(subject_name != subjectText(StudentData[target_students[index]][dayNum][timeNum])) {
                        flag = false
                        break
                    }
                }
                if(!flag) {subject_name = ""}
                TableHTML += `<td class="subjectTd ${flag ? "isGood" : "emptyTd isBad"}"><div class="cell">
                    <div class="subject_name">${subject_name}</div>
                    <div class="intersect"></div>
                </div></td>`
            }
        }
        TableHTML += `</tr>`
    }
    TableHTML += `</tbody>\n</table>`
    return TableHTML
}

export {makeTable, StudentData, SubjectData}

// makeTable(0, ["이홍균"])