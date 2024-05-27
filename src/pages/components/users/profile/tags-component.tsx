'use-clent'

import { useState } from "react"
import { Modal,Button } from "react-bootstrap"


type TagRowType = {
    tagItem:any;
    serialNumber:any;
    handleDelete:any;
};

let tags:any = []; //'tags' varibale used here for test purose, when the layout is setup then remove this variable. 
function TagRow({tagItem, serialNumber, handleDelete}:TagRowType){
    return(
    <tr className="text-center">
        <td>{serialNumber}</td>
        <td>{tagItem.tagName}</td>
        <td>{tagItem.questionnaire && <h5><span className="badge bg-success">Answered</span></h5> }</td>
        <td className="action-btn">
            <button type="button" className="btn btn-warning btn-sm tag-edit-btn">View</button>
            <button type="button" className="btn btn-danger btn-sm tag-delete-btn" onClick={handleDelete}>Delete</button>
        </td>
    </tr>
    )
}


export default function TagList(){

    const[tagList,setTagList] = useState<Array<any>>(tags)
    const[deletedTag, setDeletedTag] = useState(0)
    const [show, setShow] = useState(false)

    const handleClose = () => {
        setDeletedTag(0)
        setShow(false)
    }

    const handleDelete = (tag:any)=>{
        setDeletedTag(tag.id)
        setShow(true)
    }
    const handleConfirm = ()=>{
        if(deletedTag > 0){
            let newTagList = tagList.filter(tag=>tag.id!=deletedTag)
            setTagList(newTagList)
            setShow(false)
        }
    }

    return (
        <div className="row">
            <div className="col-12">
               {tagList.length > 0 &&
                 <div className="tags_table">
                    <h5>Theme List</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Theme Name</th>
                                <th>Questionnaire</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tagList.map((tag,index)=><TagRow key={index} tagItem={tag} serialNumber={index+1} handleDelete = {()=>{handleDelete(tag)}}/>)}
                        </tbody>
                    </table>
                    </div>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Remove Item!</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>are you sure?</Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                            Close
                            </Button>
                            <Button variant="danger" onClick={handleConfirm}>
                            Confirm
                            </Button>
                        </Modal.Footer>
                    </Modal>
                 </div>
                }
            </div>
        </div>
    )
}


function DeleteModal(){

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    return(
        <>
        <Button variant="primary" onClick={handleShow}>
          Launch demo modal
        </Button>
  
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleClose}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )

}