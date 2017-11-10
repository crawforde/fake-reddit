import React from 'react';
import axios from 'axios';

class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            votes: '',
            commentOpen: false,
            content: '',
            comments: []
        };
    }

    componentWillMount() {
        console.log(this.props.comment);
        var votes = this.props.comment.votes ? this.props.comment.votes.reduce((sum, val)=>(sum + parseInt(val.up)), 0) : 0;
        this.setState({
            votes: votes,
            comments: this.props.comment.children ? this.props.comment.children : []
        });
    }

    onContentChange(e) {
        this.setState({
            content: e.target.value
        });
    }

    async vote(value) {
        try {
            const result = await axios.post('/api/post/vote', { postId: this.props.comment.id, vote: value });
            console.log('vote result: ', result);
            if (result.data.new) {
                this.setState({ votes: value === '1' ? this.state.votes + 1 : this.state.votes - 1 });
            } else if (result.data.changed) {
                this.setState({votes: value === '1' ? this.state.votes + 2 : this.state.votes - 2});
            } else {
                console.log('already voted that direction');
            }
        } catch (e) {
            this.setState({ message: e.response.data.error });
        }
    }

    async postComment() {
        try {
            await axios.post('/api/post/new', { parentId: this.props.comment.id, content: this.state.content });
            this.setState({
                content: '',
                commentOpen: false,
                comments: this.state.comments.concat({content: this.state.content, createdAt: 'just now', user: 'you', votes: 0})
            });
        } catch (e) {
            console.log('error: ', e);
            this.setState({
                message: e.response ? e.response.data.error : e
            });
        }
    }

    render() {
        return (
          <div className="eachcomment" style={{ borderRadius: 5, border: '1px solid gray', padding: 5}}>
            <div className="commentcontent">
              <div><b>{this.props.comment.user.username ? this.props.comment.user.username : this.props.comment.user}</b></div>
              <div>{this.props.comment.content}</div>
              <div><i>at: {this.props.comment.createdAt}</i></div>
            </div>
            <div className="postvotes" style={{ display: "flex" }}>
              <button onClick={() => this.vote('1')}>+</button>
              <button onClick={() => this.vote('-1')}>-</button>
              <div>{this.state.votes}</div>
            </div>
            <div onClick={() => this.setState({ commentOpen: true })}>reply</div>
            { this.state.commentOpen ?
              <div className="commentform">
                <textarea type="text" name="content" value={this.state.content} onChange={(e) => this.onContentChange(e)} />
                <button onClick={() => this.postComment()}>post</button>
              </div>
            : null }
            <div>comments ({this.state.comments.length})</div>
            {this.state.comments.map((comment, id) => <Comment key={id} comment={comment} />)}
          </div>
        );
    }
    }

export default Comment;
