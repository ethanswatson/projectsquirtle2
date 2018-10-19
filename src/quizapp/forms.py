from django import forms

class CreateQuizForm(forms.Form):
    quizName = forms.CharField(
        widget = forms.TextInput(),
        label = "Quiz Name", 
        max_length = 25,
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
        max_length = 512,
        help_text = "Please decribe what this quiz is about. Must be less than 500 characters.")