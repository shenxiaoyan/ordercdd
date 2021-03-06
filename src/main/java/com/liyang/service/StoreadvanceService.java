package com.liyang.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Date;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.liyang.domain.base.AbstractAuditorAct.ActGroup;
import com.liyang.domain.loan.Loan;
import com.liyang.domain.base.ActRepository;
import com.liyang.domain.base.AuditorEntityRepository;
import com.liyang.domain.base.LogRepository;
import com.liyang.domain.storeadvance.Storeadvance;
import com.liyang.domain.storeadvance.Storeadvance.StoreadvanceType;
import com.liyang.domain.storeadvance.StoreadvanceAct;
import com.liyang.domain.storeadvance.StoreadvanceActRepository;
import com.liyang.domain.storeadvance.StoreadvanceFile;
import com.liyang.domain.storeadvance.StoreadvanceLog;
import com.liyang.domain.storeadvance.StoreadvanceLogRepository;
import com.liyang.domain.storeadvance.StoreadvanceRepository;
import com.liyang.domain.storeadvance.StoreadvanceState;
import com.liyang.domain.storeadvance.StoreadvanceStateRepository;
import com.liyang.domain.storeadvance.StoreadvanceWorkflow;
import com.liyang.domain.storeadvance.StoreadvanceWorkflowRepository;

@Service
public class StoreadvanceService extends AbstractWorkflowService<Storeadvance, StoreadvanceWorkflow,StoreadvanceAct, StoreadvanceState, StoreadvanceLog, StoreadvanceFile>{
	@Autowired
	StoreadvanceActRepository storeadvanceActRepository;
	@Autowired
	StoreadvanceStateRepository storeadvanceStateRepository;
	@Autowired
	StoreadvanceLogRepository  storeadvanceLogRepository;
	@Autowired
	StoreadvanceRepository  storeadvanceRepository;
	@Autowired
	StoreadvanceWorkflowRepository storeadvanceWorkflowRepository;

	@Override
	@PostConstruct
	public void sqlInit() {
		long count  = storeadvanceActRepository.count();
		if(count==0){
			StoreadvanceAct save1 = storeadvanceActRepository.save(new StoreadvanceAct("创建","create",10,ActGroup.UPDATE));
			StoreadvanceAct save2 = storeadvanceActRepository.save(new StoreadvanceAct("读取","read",20,ActGroup.READ));
			StoreadvanceAct save3 = storeadvanceActRepository.save(new StoreadvanceAct("更新","update",30,ActGroup.UPDATE));
			StoreadvanceAct save4 = storeadvanceActRepository.save(new StoreadvanceAct("删除","delete",40,ActGroup.UPDATE));
			StoreadvanceAct save5 = storeadvanceActRepository.save(new StoreadvanceAct("自己的列表","listOwn",50,ActGroup.READ));
			StoreadvanceAct save6 = storeadvanceActRepository.save(new StoreadvanceAct("部门的列表","listOwnDepartment",60,ActGroup.READ));
			StoreadvanceAct save7 = storeadvanceActRepository.save(new StoreadvanceAct("部门和下属部门的列表","listOwnDepartmentAndChildren",70,ActGroup.READ));
			StoreadvanceAct save8 = storeadvanceActRepository.save(new StoreadvanceAct("通知其他人","noticeOther",80,ActGroup.NOTICE));
			StoreadvanceAct save9 = storeadvanceActRepository.save(new StoreadvanceAct("通知操作者","noticeActUser",90,ActGroup.NOTICE));
			StoreadvanceAct save10 = storeadvanceActRepository.save(new StoreadvanceAct("通知展示人","noticeShowUser",100,ActGroup.NOTICE));
	
			StoreadvanceState newState =new StoreadvanceState("已创建",0,"CREATED");
			newState = storeadvanceStateRepository.save(newState);
			
			StoreadvanceState enableState = new StoreadvanceState("有效",100,"ENABLED");
			enableState.setActs(Arrays.asList(save1,save2,save3,save4,save5,save6,save7).stream().collect(Collectors.toSet()));
			storeadvanceStateRepository.save(enableState);
			storeadvanceStateRepository.save(new StoreadvanceState("无效",200,"DISABLED"));
			storeadvanceStateRepository.save(new StoreadvanceState("已删除",300,"DELETED"));

			storeadvanceStateRepository.save(new StoreadvanceState("未垫付",40,"ADVANCE"));
			storeadvanceStateRepository.save(new StoreadvanceState("已垫付",30,"ADVANCED"));
			storeadvanceStateRepository.save(new StoreadvanceState("已到账",20,"CLOSED"));
		}
	}

	@Override
	public LogRepository<StoreadvanceLog> getLogRepository() {
		return storeadvanceLogRepository;
	}

	@Override
	public AuditorEntityRepository<Storeadvance> getAuditorEntityRepository() {
		return storeadvanceRepository;
	}


	@Override
	@PostConstruct 
	public void injectLogRepository() {
		new Storeadvance().setLogRepository(storeadvanceLogRepository);
	}

	@Override
	public StoreadvanceLog getLogInstance() {
		return new StoreadvanceLog();
	}

	@Override
	public ActRepository<StoreadvanceAct> getActRepository() {
		return storeadvanceActRepository;
	}

	@Override
	@PostConstruct 
	public void injectEntityService() {
		new Storeadvance().setService(this);
		
	}

	@Override
	public StoreadvanceFile getFileLogInstance() {
		return new StoreadvanceFile();
	}
	
	/**生成一条门店垫付
	 * @param loan
	 */
	public void create(Loan loan, BigDecimal payableAmount, StoreadvanceType type) {
		if (loan == null) {
			return;
		}
		if (loan.getOrdercdd() == null) {
			return;
		}
		if (payableAmount == null) {
			return;
		}
		Storeadvance storeadvance = new Storeadvance();
		storeadvance.setLoan(loan);
		storeadvance.setDepartment(loan.getOrdercdd().getCreatedByDepartment());
		storeadvance.setPayableAmount(payableAmount);
		storeadvance.setType(type);
		StoreadvanceState state = storeadvanceStateRepository.findByStateCode("ADVANCE");//未垫付
		storeadvance.setState(state);
		storeadvanceRepository.save(storeadvance);
	}
	
	/**确认到账
	 * @param storeadvance
	 * @return
	 */
	public Storeadvance doRealpay(Storeadvance storeadvance) {
		storeadvance.setPayTime(new Date());
		//实际到账金额
		storeadvance.setRealAmount(storeadvance.getPayableAmount());
		storeadvanceRepository.save(storeadvance);
		return storeadvance;
	}
}
