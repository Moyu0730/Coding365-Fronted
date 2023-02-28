
var bookDataFromLocalStorage = [];
var bookLendDataFromLocalStorage =[];

var areaOption={
    "query":"q",
    "detail":"d"
}

var state="";

var stateOption={
    "add":"add",
    "update":"update"
}

var defauleBookStatusId="A";

$(function () {
    loadBookData();
    registerRegularComponent();

    var validator = $("#book_detail_area").kendoValidator({
        rules:{
            dateCheckRule: function(input){
                
                if (input.is(".date_picker")) {
                    return $("#"+$(input).prop("id")).data("kendoDatePicker").value();
                }
                return true;
            }
        },
        messages: { 
            dateCheckRule: function(input){ return input.attr("data-message_prefix")+"格式有誤";}
          }
        }).data("kendoValidator");


    $("#book_detail_area").kendoWindow({
        width: "1200px",
        title: "新增書籍",
        visible: false,
        modal: true,
        actions: [
            "Close"
        ],
        close: onBookWindowClose
    }).data("kendoWindow").center();

    $("#book_record_area").kendoWindow({
        width: "700px",
        title: "借閱紀錄",
        visible: false,
        modal: true,
        actions: [
            "Close"
        ]
    }).data("kendoWindow").center();
    

    $("#btn_add_book").click(function (e) {
        e.preventDefault();
        state=stateOption.add;

        enableBookDetail(true);
        clear(areaOption.detail);
        setStatusKeepRelation(state);

        $("#btn-save").css("display","");        
        $("#book_detail_area").data("kendoWindow").title("新增書籍");
        $("#book_detail_area").data("kendoWindow").open();
    });


    $("#btn_query").click(function (e) {
        e.preventDefault();
        queryBook();
    });

    $("#btn_clear").click(function (e) {
        e.preventDefault();

        clear(areaOption.query);
        queryBook();
    });

    $("#btn-save").click(function (e) {
        e.preventDefault();
        if (validator.validate()) {
            switch (state) {
                case "add":
                    addBook();
                    break;
                case "update":
                    updateBook($("#book_id_d").val());
                break;
                default:
                    break;
            }
        }

        
    });

    $("#book_grid").kendoGrid({
        dataSource: {
            data: bookDataFromLocalStorage,
            schema: {
                model: {
                    id:"BookId",
                    fields: {
                        BookId: { type: "int" },
                        BookClassName: { type: "string" },
                        BookName: { type: "string" },
                        BookBoughtDate: { type: "string" },
                        BookStatusName: { type: "string" },
                        BookKeeperCname: { type: "string" }
                    }
                }
            },
            pageSize: 20,
        },
        height: 550,
        sortable: true,
        pageable: {
            input: true,
            numeric: false
        },
        columns: [
            { field: "BookId", title: "書籍編號", width: "10%" },
            { field: "BookClassName", title: "圖書類別", width: "15%" },
            { field: "BookName", title: "書名", width: "30%" ,
              template: "<a style='cursor:pointer; color:blue' onclick='showBookForDetail(event,#:BookId #)'>#: BookName #</a>"
            },
            { field: "BookBoughtDate", title: "購書日期", width: "15%" },
            { field: "BookStatusName", title: "借閱狀態", width: "15%" },
            { field: "BookKeeperCname", title: "借閱人", width: "15%" },
            { command: { text: "借閱紀錄", click: showBookLendRecord }, title: " ", width: "120px" },
            { command: { text: "修改", click: showBookForUpdate }, title: " ", width: "100px" },
            { command: { text: "刪除", click: deleteBook }, title: " ", width: "100px" }
        ]

    });

    $("#book_record_grid").kendoGrid({
        dataSource: {
            data: [],
            schema: {
                model: {
                    fields: {
                        LendDate: { type: "string" },
                        BookKeeperId: { type: "string" },
                        BookKeeperEname: { type: "string" },
                        BookKeeperCname: { type: "string" }
                    }
                }
            },
            pageSize: 20,
        },
        height: 250,
        sortable: true,
        pageable: {
            input: true,
            numeric: false
        },
        columns: [
            { field: "LendDate", title: "借閱日期", width: "10%" },
            { field: "BookKeeperId", title: "借閱人編號", width: "10%" },
            { field: "BookKeeperEname", title: "借閱人英文姓名", width: "15%" },
            { field: "BookKeeperCname", title: "借閱人中文姓名", width: "15%" },
        ]
    });

})

function loadBookData() {
    bookDataFromLocalStorage = JSON.parse(localStorage.getItem("bookData"));
    if (bookDataFromLocalStorage == null) {
        bookDataFromLocalStorage = bookData;
        localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));
    }

    bookLendDataFromLocalStorage = JSON.parse(localStorage.getItem("lendData"));
    if (bookLendDataFromLocalStorage == null) {
        bookLendDataFromLocalStorage = lendData;
        localStorage.setItem("lendData", JSON.stringify(bookLendDataFromLocalStorage));
    }
}

function onClassChange() {
    var selectedValue = $("#book_class_d").data("kendoDropDownList").value();
    if(selectedValue===""){
        $("#book_image_d").attr("src", "image/optional.jpg");
    }else{
        $("#book_image_d").attr("src", "image/" + selectedValue + ".jpg");
    }
}

function onBookWindowClose() {
    clear(areaOption.detail);
}

function addBook() { 

    var grid=getBooGrid();
    var bookClassId=$("#book_class_d").data("kendoDropDownList").value();
    
    var book = {
        "BookId": Math.max(...bookDataFromLocalStorage.map(m=>m.BookId))+1,
        "BookName": $("#book_name_d").val(),
        "BookClassId": bookClassId,
        "BookClassName": classData.find(m=>m.value==bookClassId).text,
        "BookBoughtDate": kendo.toString($("#book_bought_date_d").data("kendoDatePicker").value(),"yyyy-MM-dd"),
        "BookStatusId": defauleBookStatusId,
        "BookStatusName": bookStatusData.find(m=>m.StatusId==defauleBookStatusId).StatusText,
        "BookKeeperId": "",
        "BookKeeperCname": "",
        "BookKeeperEname": "",
        "BookAuthor": $("#book_author_d").val(),
        "BookPublisher": $("#book_publisher_d").val(),
        "BookNote": $("#book_note_d").val()
    }

    grid.dataSource.add(book);

    bookDataFromLocalStorage.push(book);
    localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));
    $("#book_detail_area").data("kendoWindow").close();
 }

function updateBook(bookId){
    
    var book=bookDataFromLocalStorage.find(m=>m.BookId==bookId)

    book.BookName=$("#book_name_d").val();
    book.BookClassId=$("#book_class_d").data("kendoDropDownList").value();
    book.BookClassName=$("#book_class_d").data("kendoDropDownList").text();

    var bookBoughtDate=kendo.toString($("#book_bought_date_d").data("kendoDatePicker").value(),"yyyy-MM-dd");
    book.BookBoughtDate=bookBoughtDate
    
    var bookStatusId=$("#book_status_d").data("kendoDropDownList").value();
    book.BookStatusId=bookStatusId
    book.BookStatusName=$("#book_status_d").data("kendoDropDownList").text()
    
    var bookKeeperId=$("#book_keeper_d").data("kendoDropDownList").value();
    var bookKeeperCname=
        bookKeeperId==""?"":memberData.find(m=>m.UserId==bookKeeperId).UserCname;

    var bookKeeperEname=
        bookKeeperId==""?"":memberData.find(m=>m.UserId==bookKeeperId).UserEname;

    book.BookKeeperId=bookKeeperId;
    book.BookKeeperCname=bookKeeperCname;
    book.BookKeeperEname=bookKeeperEname;

    book.BookAuthor=$("#book_author_d").val();
    book.BookPublisher=$("#book_publisher_d").val();
    book.BookNote=$("#book_note_d").val();

    var grid=getBooGrid();
    grid.dataSource.pushUpdate(book);
    localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));

    if(bookStatusId=="B" || bookStatusId=="C"){
        addBookLendRecord(bookId,bookKeeperId,bookBoughtDate,bookKeeperCname,bookKeeperEname);
    }
    
    $("#book_detail_area").data("kendoWindow").close();

    clear(areaOption.detail);
 }

 function addBookLendRecord(bookId,bookKeeperId,bookBoughtDate,bookKeeperCname,bookKeeperEname) {  
    bookLendDataFromLocalStorage.push({
        "BookId":bookId,
        "BookKeeperId":bookKeeperId,
        "BookKeeperCname":bookKeeperCname,
        "BookKeeperEname":bookKeeperEname,
        "LendDate":bookBoughtDate
    })
    localStorage.setItem("lendData", JSON.stringify(bookLendDataFromLocalStorage));
 }

function queryBook(){
    
    var grid=getBooGrid();

    var bookName=$("#book_name_q").val();
    var bookClassId=$("#book_class_q").data("kendoDropDownList").value() ?? "";
    var bookKeeperId=$("#book_keeper_q").data("kendoDropDownList").value() ?? "";
    var bookStatusId=$("#book_status_q").data("kendoDropDownList").value() ?? "";

    var filtersCondition=[];
    if(bookName!=""){
        filtersCondition.push({ field: "BookName", operator: "contains", value: bookName });
    }
    if(bookClassId!=""){
        filtersCondition.push({ field: "BookClassId", operator: "contains", value: bookClassId });
    }
    if(bookKeeperId!=""){
        filtersCondition.push({ field: "BookKeeperId", operator: "contains", value: bookKeeperId });
    }
    if(bookStatusId!=""){
        filtersCondition.push({ field: "BookStatusId", operator: "contains", value: bookStatusId });
    }

    grid.dataSource.filter({
        logic: "and",
        filters:filtersCondition
    });
}

function deleteBook(e) {
    e.preventDefault();
    
    var grid = getBooGrid();
    
    var row = grid.dataItem(e.target.closest("tr"));

    if (confirm("確定刪除")) {
        if(checkBookDeleteable(row.BookId)){
            grid.dataSource.remove(row);
            
            var idx = bookDataFromLocalStorage.map(m => m.BookId).indexOf(row.BookId);

            bookDataFromLocalStorage.splice(idx, 1);

            localStorage.setItem("bookData", JSON.stringify(bookDataFromLocalStorage));
            alert("刪除成功");
        }
    }
}

function checkBookDeleteable(bookId) { 

    var bookStatusId=bookDataFromLocalStorage.find(m=>m.BookId==bookId).BookStatusId;
    var result=true;
    if(bookStatusId=="B" || bookStatusId=="C"){
        alert("借出中不可刪除");
        result=false;
    }
    if(bookLendDataFromLocalStorage.filter(m=>m.BookId==bookId).length>0){
        alert("該書有借閱紀錄不可刪除");
        result=false;
    }
    return result;

 }

function showBookForUpdate(e) {
    e.preventDefault();

    state=stateOption.update;
    $("#book_detail_area").data("kendoWindow").title("修改書籍");
    $("#btn-save").css("display","");
    var grid = getBooGrid();
    var bookId = grid.dataItem(e.target.closest("tr")).BookId;

    enableBookDetail(true);
    bindBook(bookId);
    onClassChange();
    setStatusKeepRelation();
    $("#book_detail_area").data("kendoWindow").open();
}

function showBookForDetail(e,bookId) {
    e.preventDefault();

    state=stateOption.update;

    $("#book_detail_area").data("kendoWindow").title("書籍明細");
    $("#btn-save").css("display","none");
    
    var grid = getBooGrid();
    var bookId = grid.dataItem(e.target.closest("tr")).BookId;
    
    bindBook(bookId);
    onClassChange();
    setStatusKeepRelation();
    enableBookDetail(false);
    $("#book_detail_area").data("kendoWindow").open();
}

function enableBookDetail(enable) { 

    $("#book_id_d").prop('readonly', !enable);
    $("#book_name_d").prop('readonly', !enable);
    $("#book_author_d").prop('readonly', !enable);
    $("#book_publisher_d").prop('readonly', !enable);
    $("#book_note_d").prop('readonly', !enable);
    if(enable){
        $("#book_class_d").data("kendoDropDownList").enable(true);
        $("#book_status_d").data("kendoDropDownList").enable(true);
        $("#book_keeper_d").data("kendoDropDownList").enable(true);
        $("#book_bought_date_d").data("kendoDatePicker").enable(true);
    }else{
        $("#book_class_d").data("kendoDropDownList").readonly();
        $("#book_status_d").data("kendoDropDownList").readonly();
        $("#book_keeper_d").data("kendoDropDownList").readonly();
        $("#book_bought_date_d").data("kendoDatePicker").readonly();
    }


 }

function bindBook(bookId){
    var book = bookDataFromLocalStorage.find(m => m.BookId == bookId);
    $("#book_id_d").val(bookId);
    $("#book_name_d").val(book.BookName);
    $("#book_author_d").val(book.BookAuthor);
    $("#book_publisher_d").val(book.BookPublisher);
    $("#book_note_d").val(book.BookNote);
    $("#book_class_d").data("kendoDropDownList").value(book.BookClassId);
    $("#book_status_d").data("kendoDropDownList").value(book.BookStatusId);
    $("#book_keeper_d").data("kendoDropDownList").value(book.BookKeeperId);
    $("#book_bought_date_d").data("kendoDatePicker").value(book.BookBoughtDate);
}

function showBookLendRecord(e) {
    e.preventDefault();
    
    var grid = getBooGrid();
    var row = grid.dataItem(e.target.closest("tr"));
    var bookLendData=bookLendDataFromLocalStorage.filter(m=>m.BookId==row.BookId);
    $("#book_record_grid").data("kendoGrid").dataSource.data(bookLendData);
    //$("#book_detail_area").data("kendoWindow").title("新增書籍");
    $("#book_record_area").data("kendoWindow").title(
            bookDataFromLocalStorage.find(m=>m.BookId==row.BookId).BookName+"借閱紀錄").open();
    
}

function clear(area) {

    switch (area) {
        case "q":
            $("#book_name_q").val("");
            $("#book_class_q").data("kendoDropDownList").select(0);
            $("#book_status_q").data("kendoDropDownList").select(0);
            $("#book_keeper_q").data("kendoDropDownList").select(0);
            break;
    
        case "d":
            $("#book_name_d").val("");
            $("#book_author_d").val("");
            $("#book_publisher_d").val("");
            $("#book_note_d").val("");
            $("#book_class_d").data("kendoDropDownList").select(0);
            $("#book_status_d").data("kendoDropDownList").select(0);
            $("#book_keeper_d").data("kendoDropDownList").select(0);
            $("#book_bought_date_d").data("kendoDatePicker").value(new Date());
            onClassChange();
            $("#book_detail_area").kendoValidator().data("kendoValidator").reset();
            break;
        default:
            break;
    }
}
                      
function setStatusKeepRelation() { 
    
    switch (state) {
        case "add":
            $("#book_status_d_col").css("display","none");
            $("#book_keeper_d_col").css("display","none");
        
            $("#book_status_d").prop('required',false);
            $("#book_keeper_d").prop('required',false);            
            break;
        case "update":
            $("#book_status_d_col").css("display","");
            $("#book_keeper_d_col").css("display","");
            $("#book_status_d").prop('required',true);

            var bookStatusId=$("#book_status_d").data("kendoDropDownList").value();

            if(bookStatusId=="A" || bookStatusId=="U"){
                $("#book_keeper_d").prop('required',false);
                $("#book_keeper_d").data("kendoDropDownList").value("");
                $("#book_detail_area").data("kendoValidator").validateInput($("#book_keeper_d"));
                
                $("#book_keeper_d").data("kendoDropDownList").readonly();
                $("#book_keeper_d_label").removeClass("required");
                
            }else{
                $("#book_keeper_d").prop('required',true);
                $("#book_keeper_d").data("kendoDropDownList").enable(true);
                $("#book_keeper_d_label").addClass("required");
            }
            break;
        default:
            break;
    }
    
 }

function registerRegularComponent(){
    $("#book_class_q").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: classData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_class_d").kendoDropDownList({
        dataTextField: "text",
        dataValueField: "value",
        dataSource: classData,
        optionLabel: "請選擇",
        index: 0,
        change: onClassChange
    });

    $("#book_keeper_q").kendoDropDownList({
        dataTextField: "UserCname",
        dataValueField: "UserId",
        dataSource: memberData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_keeper_d").kendoDropDownList({
        dataTextField: "UserCname",
        dataValueField: "UserId",
        dataSource: memberData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_status_q").kendoDropDownList({
        dataTextField: "StatusText",
        dataValueField: "StatusId",
        dataSource: bookStatusData,
        optionLabel: "請選擇",
        index: 0
    });

    $("#book_status_d").kendoDropDownList({
        dataTextField: "StatusText",
        dataValueField: "StatusId",
        dataSource: bookStatusData,
        optionLabel: "請選擇",
        change:setStatusKeepRelation,
        index: 0
    });


    $("#book_bought_date_d").kendoDatePicker({
        format: "yyyy-MM-dd",
        value: new Date(),
        dateInput: true
    });
}

function getBooGrid(){
    return $("#book_grid").data("kendoGrid");
}