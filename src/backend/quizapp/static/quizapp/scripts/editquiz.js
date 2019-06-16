var addQuestion = function(){

    var addForm = document.getElementById('addForm');
    addForm.setAttribute('style', 'display:none');

    var questionForm = document.getElementById('questionForm');
    questionForm.setAttribute('style', 'display:inline; padding: 10px');
    
}

var cancelAdd = function(){
    var addForm = document.getElementById('addForm');
    addForm.setAttribute('style', 'display:inline; padding: 10px');

    var questionForm = document.getElementById('questionForm');
    questionForm.setAttribute('style', 'display:none');

}