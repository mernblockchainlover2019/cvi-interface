import React, { useMemo } from 'react';
import Comment from '../Comment/Comment';
import './CommentsSection.scss';

const CommentsSection = () => {
    return useMemo(() => {
        return (
            <div className="comments-component">
                <Comment 
                    title="Professor Dan Galai," 
                    subTitle="Creator of VIX and CVI advisor" 
                    comment={`"I am confident the CVI team has the knowledge and capability to put theory into practice and build a truly useful product in the cryptocurrency space"`}
                />
            </div>
        )
    }, []);
}

export default CommentsSection;