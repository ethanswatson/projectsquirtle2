from django import forms


class CreateQuizForm(forms.Form):
    quizName = forms.CharField(
        widget = forms.TextInput(),
        label = "Quiz Name", 
        max_length = 20,
        help_text = "Must be less than 25 characters.")
    quizDescription = forms.CharField(
        #widget=forms.TextInput(attrs={'size': '40'}),
        widget=forms.Textarea(
            attrs = {
                'rows': '10',
                'cols': '40', 
                'style': 'resize: none'
                }),
        label = "Quiz Description", 
        help_text = "Please decribe what this quiz is about. Must be less than 500 characters.")

class CreateAnswerForm(forms.Form):

    answerText = forms.CharField(
        widget = forms.TextInput(),
        label = "Question",
        max_length = 50,
        help_text = "Must be less than 25 characters."
    )
    correct = forms.BooleanField(
        widget = forms.CheckboxInput(),
        label = "Correct Answer",    
        required = False,
    )
    pointValue = forms.IntegerField(
        initial=0,
        label = "Answer Value",
        required = False,
    )
