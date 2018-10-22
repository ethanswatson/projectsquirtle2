var addAnswer = function(){

    var addForm = document.getElementById('addForm');
    addForm.setAttribute('style', 'display:none');

    var questionForm = document.getElementById('answerForm');
    questionForm.setAttribute('style', 'display:inline');
    
}

var cancelAdd = function(){
    var addForm = document.getElementById('addForm');
    addForm.setAttribute('style', 'display:inline');

    var questionForm = document.getElementById('answerForm');
    questionForm.setAttribute('style', 'display:none');

}