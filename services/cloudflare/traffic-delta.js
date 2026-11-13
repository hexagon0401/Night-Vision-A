/** Change IDs only, never a second position-history database. */
export class TrafficDelta{
 constructor(ttl){this.ttl=ttl;this.generation=crypto.randomUUID();this.seq=0;this.rows=new Map();this.log=[];}
 update(items,now=Date.now()){
  const next=new Map(items.map(item=>[item.id,item]));
  for(const [id,item]of next){if(JSON.stringify(this.rows.get(id))!==JSON.stringify(item))this.log.push({seq:++this.seq,id,op:'upsert',at:now});}
  for(const [id,item]of this.rows)if(!next.has(id))this.log.push({seq:++this.seq,id,op:now-Date.parse(item.observed_at)>=this.ttl?'expired':'remove',at:now});
  this.rows=next;this.log=this.log.filter(x=>now-x.at<480000).slice(-100000);
 }
 response(cursor){
  const match=typeof cursor==='string'?cursor.match(/^([\w-]+)\.(\d+)$/):null,n=match?Number(match[2]):-1;
  const valid=match&&match[1]===this.generation&&n<=this.seq&&n>=(this.log[0]?.seq??this.seq)-1;
  const changes=new Map();if(valid)for(const entry of this.log)if(entry.seq>n)changes.set(entry.id,entry.op);
  return {generation:this.generation,cursor:this.generation+'.'+this.seq,mode:valid?'delta':'snapshot',upserts:valid?[...changes].filter(([id,op])=>op==='upsert'&&this.rows.has(id)).map(([id])=>this.rows.get(id)):[...this.rows.values()],removed_ids:valid?[...changes].filter(([,op])=>op==='remove').map(([id])=>id):[],expired_ids:valid?[...changes].filter(([,op])=>op==='expired').map(([id])=>id):[]};
 }
}
