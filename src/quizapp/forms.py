from django import forms


class CreateQuizForm(forms.Form):
    quizName = forms.CharField(
        widget = forms.TextInput(
            attrs = {
                'size': '35',
            }
        ),
        label = "Quiz Name", 
        max_length = 20,
        help_text = "Please enter you quizzes name.")
    quizDescription = forms.CharField(
        #widget=forms.TextInput(attrs={'size': '40'}),
        widget=forms.Textarea(
            attrs = {
                'rows': '10',
                'cols': '40', 
                'style': 'resize: none'
                }),
        label = "Quiz Description", 
        help_text = "Please decribe what this quiz is about.")

class CreateAnswerForm(forms.Form):

    answerText = forms.CharField(
        widget = forms.TextInput(attrs = {'size': '40'}),
        label = "Answer",
        max_length = 50,
        help_text = "Must be less than 25 characters."
    )
    isCorrect = forms.BooleanField(
        widget = forms.CheckboxInput(),
        label = "Correct Answer",    
        required = False,
    )
    pointValue = forms.IntegerField(
        initial=0,
        label = "Answer Value",
    )
