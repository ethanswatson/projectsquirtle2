var answers = document.querySelectorAll('.answer-box');

var labels = ['A','B','C','D','E','F'];

var i;
for (i = 0; i < labels.length; i++) {
    var answer = answers[i];
    var label = labels[i];
    answer.setAttribute('value', label);
    answerText = answer.querySelector('.answer-option');
    answerText.innerHTML = label + ': ' + answerText.innerHTML;
    answer.onclick = submitAnswer;
}

function submitAnswer() {

}
