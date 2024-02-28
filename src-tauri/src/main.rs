use std::{fmt::Debug, fs};

use lazy_static::lazy_static;
use rusqlite::Connection;
use dirs::home_dir;

lazy_static!(

  #[derive(Debug)]
  pub static ref FILE_PATH:String = {
    let home = home_dir().unwrap().to_string_lossy().to_string(); 
    let process_dir = format!("{}{}", home,"/myprocess/db/".to_string());
    let file_path = format!("{}{}", home,"/myprocess/db/sec.db".to_string());
    if (!fs::metadata(&process_dir).is_ok()) 
                || (!fs::metadata(&process_dir).unwrap().is_dir()) {
      fs::create_dir_all(&process_dir).unwrap();
    }
    // if (!fs::metadata(file_path).is_ok()) || (!fs::metadata(file_path).unwrap().is_file()) {
    let conn = Connection::open(&file_path);
    conn.unwrap().execute(
        "CREATE TABLE if not exists sec(col1 text, col2 text, col3 text);",
        [],
    ).unwrap();
    file_path

  };
);

use serde::Serialize;
#[derive(Serialize,Debug)]
struct Sec {
  col1: String,
  col2: String,
  col3: String
}


#[tauri::command]
fn greet() -> Vec<Sec> {
   let conn = Connection::open(FILE_PATH.as_str()).unwrap();
   let mut prepare = conn.prepare("select * from sec;").unwrap();
   let mut secvec: Vec<Sec> = Vec::new();
   let secs = prepare.query_map([], |row| {
      Ok(
        Sec {
          col1 : row.get(0)?,
          col2 : row.get(1)?,
          col3 : row.get(2)?,
        }
      )
   }).unwrap();

   for sec in secs {
       let s = sec.unwrap();
       secvec.push(s);
   };
   secvec

}

#[tauri::command]
fn getOne(title: String) -> Vec<Sec>{
  let mut secvec: Vec<Sec> = Vec::new();
  if title == "" {
      return secvec;
  }
  let conn = Connection::open(FILE_PATH.as_str()).unwrap();
  let query = format!("select * from sec where col1 like '%{}%'",title);
  let mut stmt = conn.prepare(&query).unwrap();
  //let parameter_index = stmt.parameter_index(":col1").unwrap();
  //stmt.raw_bind_parameter(parameter_index.unwrap(), title);
  let mut raw_query = stmt.raw_query();
  match raw_query.next() {
      Ok(v) => {match v {
          Some(t) => {
            let sec = Sec{
              col1: t.get(0).unwrap(),
              col2: t.get(1).unwrap(),
              col3: t.get(2).unwrap(),
            };
            secvec.push(sec);
            return secvec;
          },
          None => secvec,
      }},
      Err(_) => {secvec},
  }
}

#[tauri::command]
fn update(col1: String, columnId: String, value: String) {

  let conn = Connection::open(FILE_PATH.as_str()).unwrap();
  let udp = format!("update sec set {} = '{}' where col1 = '{}'",columnId, value, col1);
  conn.execute(&udp,[]).unwrap();
}

#[tauri::command]
fn insertOne(col1: String, col2: String, col3: String) {

  let conn = Connection::open(FILE_PATH.as_str()).unwrap();
  let ins = format!("insert into sec values ('{}', '{}', '{}')",col1, col2, col3);
  conn.execute(&ins,[]).unwrap();
}

#[tauri::command]
fn deleteOne(col1: String) {

  let conn = Connection::open(FILE_PATH.as_str()).unwrap();
  let del = format!("delete from sec where col1 = '{}'",col1);
  conn.execute(&del,[]).unwrap();
}

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, getOne, update, insertOne, deleteOne])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


#[cfg(test)]
mod tests {
    use super::getOne;
    #[test]
    fn it_works() {
        let get_one = getOne(String::from("126mail"));
        println!("{:#?}",get_one);
    }
}

