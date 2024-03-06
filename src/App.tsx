import { ColumnDef, Row, RowData,  flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect, useState } from "react";
import { Sec } from "./types/sec";
import React from "react";
import "./App.css"




declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

const defaultColumn: Partial<ColumnDef<Sec>> = {
  cell: ({ getValue, row: { index }, column: { id }, table }) => {
    const initialValue = getValue()
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    // When the input is blurred, we'll call our table meta's updateData function
    const onBlur = () => {
      table.options.meta?.updateData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return (
      <input
        value={value as string}
        onChange={e => setValue(e.target.value)}
        onBlur={onBlur}
      />
    )
  },
}







  

function App() {

  // const rerender = React.useReducer(() => ({}), {})[1]
  const columns = React.useMemo<ColumnDef<Sec>[]>(
    () => [

      {
        header: 'title',
        accessorKey: 'col1',
      },
      {
        header: 'key',
        accessorKey: 'col2',
      },
      {
        header: 'value',
        accessorKey: 'col3',
      },
    ],
    []
  )


  const [data, setData] = useState<Sec[]>([]);
  const [word, setWord] = useState("")
  const [inp1, setInp1] = useState("")
  const [inp2, setInp2] = useState("")
  const [inp3, setInp3] = useState("")




  useEffect(() => {
    console.log("useEffect...")
    invoke("greet").then((response) => {
      console.log(response)
      setData(response as Sec[]);
    }).catch(() => {
      console.log("eeeeeeeeeeeeeerrrrr")
    });
    
  }, 
  
  []);



  //input handler
  function queryOneByKey (key: string){
    // console.log("KKKKKKKKKKKKKK ",key)
    if(key === "Enter"){
      queryOne()
    }
  }
  function queryOne (){
    
    console.log("@",word)
    if(word.trim() == ""){
      invoke("greet").then((response) => {
        console.log(response)
        setData(response as Sec[]);
      }).catch(() => {
        console.log("eeeeeeeeeeeeeerrrrr")
      });
      return;
    }
    invoke("getOne",{title: word}).then((response) => {
      console.log("~~~~~~~~~~~~~~~~~~~~~~",response)
      let res = response as Sec[]
      setData(res);
    }).catch(() => {
      console.log("eeeeeeeeeeeeeerrrrr")
    });
    
  }

  function insertOne () {
    console.log(inp1,"--", inp2, "--", inp3);
    invoke("insertOne",{col1: inp1, col2: inp2, col3: inp3}).then(() => {
      const inputElement1 = document.getElementById('inp1') as HTMLInputElement;
      inputElement1.value = '';
      const inputElement2 = document.getElementById('inp2') as HTMLInputElement;
      inputElement2.value = '';
      const inputElement3 = document.getElementById('inp3') as HTMLInputElement;
      inputElement3.value = '';
      const searchInp = document.getElementById('searchInp') as HTMLInputElement;
      searchInp.value = '';
      invoke("greet").then((response) => {
        console.log(response)
        setData(response as Sec[]);
      }).catch(() => {
        console.log("eeeeeeeeeeeeeerrrrr")
      });
      
    }).catch(() => {
      console.log("eeeeeeeeeeeeeerrrrr")
    });
  }

  function deleteOne(row: Row<Sec>){
    const inputElement1 = document.getElementById('inp1') as HTMLInputElement;
    inputElement1.value = '';
    const inputElement2 = document.getElementById('inp2') as HTMLInputElement;
    inputElement2.value = '';
    const inputElement3 = document.getElementById('inp3') as HTMLInputElement;
    inputElement3.value = '';
    const searchInp = document.getElementById('searchInp') as HTMLInputElement;
    searchInp.value = '';
    invoke("deleteOne",{col1: row.original.col1}).then(() => {

      invoke("greet").then((response) => {
        console.log(response)
        setData(response as Sec[]);
      }).catch(() => {
        console.log("eeeeeeeeeeeeeerrrrr")
      });
      
    }).catch(() => {
      console.log("eeeeeeeeeeeeeerrrrr")
    });
  }
 
  
  const table = useReactTable({
    data,
    columns,
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    // Provide our updateData function to our table meta
    meta: {
      updateData: (rowIndex, columnId, value) => {
        console.log(data[rowIndex].col1, "---", columnId, "----", value)
        invoke("update",{col1: data[rowIndex].col1, columnId: columnId, value: value}).then(() => {
          invoke("greet").then((response) => {
            console.log(response)
            setData(response as Sec[]);
          }).catch(() => {
            console.log("eeeeeeeeeeeeeerrrrr")
          });
        }).catch(() => {
          console.log("eeeeeeeeeeeeeerrrrr")
        });
      }
      //   setData(old =>
      //     old.map((row, index) => {
      //       if (index === rowIndex) {
      //         return {
      //           ...old[rowIndex]!,
      //           [columnId]: value,
      //         }
      //       }
      //       return row
      //     })
      //   )
      // },
    },
    debugTable: true,
  })
  

  return (
    <div className="container" style={{margin:"0 0 0 10px"}}>
      <input onChange={(e)=>{setInp1(e.target.value)}} type="text" id="inp1" style={{margin:"5px"}}/>
      <input onChange={(e)=>{setInp2(e.target.value)}} type="text" id="inp2" style={{margin:"5px"}}/>
      <input onChange={(e)=>{setInp3(e.target.value)}} type="text" id="inp3" style={{margin:"5px"}}/>
      <button onClick={()=>{insertOne();}} style={{margin:"5px", background: "#0058e9", color:"#ffffff"}}>insert</button>
      <hr/>

      <div style={{margin: "auto"}}>
        <input onChange={(e)=>{setWord(e.target.value)}}  onKeyDown={(e)=>{queryOneByKey(e.key.valueOf())}} type="text" style={{margin:"5px"}} id="searchInp"/>
        <button onClick={()=>{queryOne();}} style={{margin: "5px", background: "#0058e9", color:"#ffffff"}}>search</button>
      </div>

      <hr/>
      <div>
        <table>
          <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
          </thead>
          <tbody>
          {table.getRowModel().rows.map(row => {
            return (
              <>
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                  <button onClick={()=>{deleteOne(row);}} style={{margin:"5px", background: "#f39402"}}>delete</button>
                </tr>
              </>
            )
          })}
        </tbody>
          
        </table>
          
        
      </div>

      
    </div>
  );
}

export default App;
