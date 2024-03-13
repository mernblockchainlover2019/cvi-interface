import Question from 'components/Question';
import config from 'config/config';
import React from 'react'

const FAQ = () => {
    return (<> 
      <h2>Frequently asked questions</h2>

      <div className="help-center-component__body">
        <div className="help-center-component__body--left">
          {config.faq.left.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="question-section">
                  <h3>{section.title}</h3>
                
                  {section.questions.map(({title, content}) => 
                    <Question key={title} 
                              title={title} 
                              content={content}
                            />)}
              </div>
          ))}
        </div>

        <div className="help-center-component__body--right">
          {config.faq.right.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="question-section">
                  <h3>{section.title}</h3>
                
                  {section.questions.map(({title, content}) => 
                    <Question key={title} 
                              title={title} 
                              content={content}
                            />)}
              </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default FAQ;