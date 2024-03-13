import React, { useMemo } from 'react';
import './Comment.scss';

const Comment = ({id, title, subTitle, comment}) => {
    return useMemo(() => {
        return (
            <div className={`comment-component ${subTitle ? 'subtitle' : ''}`}>
                {id && <img src={require(`../../../../images/icons/home/${id}.svg`).default} alt={id} /> }
                <p>{comment}</p>
                <h2>{title}</h2>
                {subTitle && <h3>{subTitle}</h3> }
            </div>
        )
    }, [comment, id, subTitle, title]);
}

export default Comment;