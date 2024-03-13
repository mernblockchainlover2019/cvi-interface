import React, { useState } from 'react'
import './Question.scss';
import Button from '../Elements/Button';
import { isObject, uniqueId } from 'lodash';
import { Link } from 'react-router-dom';
import { track } from 'shared/analytics';

const Question = ({title, content, id}) => {
    const [showContent, toggleContent] = useState(false);

    const onQuestionClick = () => {
        if(!showContent) {
            track(title);
        }
        toggleContent(!showContent);
    }
    
    const parsedContent = (content) => {
        if(content?.constructor === Array) {
            return content.map(content => {
                if(isObject(content) && content.type) {
                    switch(content.type) {
                        case 'b': 
                            return <b key={uniqueId(content.type)}>{content.text}</b>
                        case 'span':
                           return <span key={uniqueId(content.type)} className={`question-component__container--${content.class}`}>{content.text}</span>
                        case 'link': 
                            return <Link key={uniqueId(content.type)} className={`question-component__container--${content.class}`} target="_blank" to={{pathname: content.to}}>{content.text}</Link>
                            case 'br': 
                            return <span key={uniqueId(content.type)}><br/></span>
                        case 'ul': 
                            return <ul key={uniqueId(content.type)}>
                                {content.list.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        default: 
                            return <span key={uniqueId(content.type)}>{content}</span>;
                    }
                }
                return <span key={uniqueId(content.type)}>{content}</span>
            });
        }
        return <span key={uniqueId(content.type)}>{content}</span>;
    }

    return (
        <div className={`question-component${showContent ? ' open' : ''}`}>
            <div className="question-component__container">
                <Button onClick={onQuestionClick} className="question-component__container--header">
                    <img src={require(`images/icons/${showContent ? 'minus' : 'plus'}.svg`).default} alt="plus" />
                    <h2>{id && <span>{id}</span>} {title}</h2>
                </Button>
                {showContent && <p className="question-component__container--content">{parsedContent(content)}</p>}
            </div>
        </div>
    )
}

export default Question;