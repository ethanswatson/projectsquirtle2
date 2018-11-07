var answers = document.querySelectorAll('.answer-box');

var i;
for (i = 0; i < answers.length; i++) {
    var answer = answers[i];
    answer.setAttribute('value', i);
    answer.onclick = submitAnswer;
}

function submitAnswer() {

}
