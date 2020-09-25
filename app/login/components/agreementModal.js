import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';

export default function AgreementModel({ visible, handleCancel }) {
  return (
    <Modal
      title="许可协议"
      visible={visible}
      footer={null}
      onCancel={handleCancel}
      bodyStyle={{
        padding: '10px',
      }}
      width={600}
    >
      <div style={{ overflowY: 'scroll', height: '300px' }}>
        <p>软件许可协议 甲方：广州市申迪计算机系统有限公司</p>
        <p> 联系地址：广州市越秀区中山一路金羊一街2号1-3层</p>
        <p> 鉴于：甲方拥有的一系列软件，乙方希望甲方向乙方授权使用上述软件。</p>
        <h2>
          <strong>第一条 定义</strong>
        </h2>
        <p>
          1. 软件，指包括甲方向乙方提供的软件包、软件框架、SDK (“Software
          Development
          Kit”)、硬件平台、操作系统和其他开发工具及其不同形式的代码（包括源代码、目标代码、二进制代码等各种形式），以及甲方对前述内容提供的调试、更新版本。
          <br />
          2.
          目的，指乙方仅将软件用于乙方开发、测试、评估、调试、分析、优化等在乙方设备上的内部的使用用途。
          <br />
          3.
          许可，指甲方授予乙方在许可期限内为本协议目的对软件的可撤销的、不可分许可的、非独占的使用许可权。
          <br />
          4.
          开源软件，指软件本身、或其他被集成的、该软件衍生的、与该软件共同发布的软件满足以下条件：
          (a)以源码形式披露或发布；(b)为生成衍生作品和/或发布衍生作品需要由使用者向第三方授权；或(c)再发布免费，才能使用、修改和/或发布。
          <br />
          5.
          第三方技术，指第三方所有的，各种使用方式都必须从第三方取得单独授权的软件和/或硬件技术。
          <br />
          6.
          知识产权，指以下有形和无形的权益：与创作作品相关的有关的权利，包括著作权、精神权、邻接权及其衍生作品的上述权利；商标服务标记和商号权；商业秘密；发明专利、实用新型专利、外观设计专利以及其他工业财产权；域名；计算机软件，以及其他原因而产生的知识产权（比如衍生产生），无论是因法律运作、条约、协议、许可或其他方式，以及通过注册、初始申请、续展、延期、继续申请、分案申请或重授权前述任何一种知识产权而产生。
          <br />
          7.
          商业秘密，指一方的专有思想、可专利思想、现有或预期的产品和服务、软件、电路图、研发、工艺、方法、流程、配方、公式、算法、参数、数据、结构设计、原理图、为合作研发设计的模具、生产、成本、利润信息、金融和金融项目、顾客、客户、市场等信息，以及当前或将来的商业计划和模型相关的所有非公开的技术或商业信息，无论该信息是否与本协议相关。
          <br />
          8.
          保密信息：指一方向另一方提供、披露的，或一方所知悉或接触到的另一方的本协议所许可的软件、所有商业秘密、技术秘密等非公开信息，无论该信息被披露时是否被指定为保密信息，也无论该信息是否与本协议相关，无论是书面或口头形式。
          <br />
        </p>
        <h2>
          <strong>第二条 许可软件</strong>
        </h2>
        <p>1. 甲方许可乙方使用软件中的可用功能。</p>
        <h2>
          <strong>第三条 许可期限</strong>{' '}
        </h2>
        <p>
          1.
          本协议生效后甲方向乙方提供本协议约定的软件，有效期直至甲方通知乙方撤回本协议约定的许可。
        </p>
        <h2>
          <strong>第四条 许可限制</strong>
        </h2>
        <p>
          1. 乙方仅能在乙方办公场所内且是乙方控制的服务器上使用、存储软件。
          <br />
          2.
          除本协议另有约定外,乙方不得在本协议期限内：（1）将软件及其修改或衍生作品全部或部分转让、授权、转租
          、分许可、再许可给任何第三方或让第三方接触；（2）对软件进行反编译、反汇编、反向工程、分解拆卸及从事其他任何试图获得软件源代码的行为。
          <br />
          3.
          甲方授权给乙方的软件中可能包含开源软件，乙方对开源软件的使用应该符合如下要求：（1）遵守相应的开源协议规定，开源协议的约定优于本协议的约定；（2）保留开源软件中原有的许可声明和版权、专利、商标情况等标识；（3）任何情況下，乙方保证不会使软件中不是开源软件的部分面临必须开源的风险。
          <br />
          4.
          软件中某些部分可能是由第三方提供的或被认为是第三方的技术。本协议中未授予乙方与第三方提供的任何部分或与第三方技术有关的任何许可或授权。若为使用软件而有必要使用第三方技术，乙方应从和/或第三方取得所有必要的许可或授权。若乙方未取得必要的授权，乙方据此同意遵守所有和/或第三方规定的与第三方技术有关的所有条款。
          <br />
          5.
          本协议期限内，甲方可能发布软件更新版本，甲方有权视具体情况通知乙方并提供更新版，但甲方无义务必须提供乙方上述更新版及维护和支持。
          <br />
        </p>
        <h2>
          <strong>第五条 所有权</strong>
        </h2>
        <p>
          1.
          甲方对软件及其可能提供给乙方的软件及其中的知识产权及其他权益归甲方所有。乙方不得删除软件中的关于软件的任何版权等声明或通知。
          <br />
          2.
          未经过甲方提前书面同意，乙方不得对软件进行修改、篡改或进行二次开发。未经过甲方同意，乙方完成的对软件的修改以及基于软件形成的衍生作品，就修改部分及衍生作品及其中的一切权利，包括但不限于其中的知识产权，归属甲方所有。
          <br />
          3.
          除本协议明确规定外，本协议未通过任何明示，默示或其他方式授予知识产权项下包括专利或版权中的任何权利。
        </p>
        <h2>
          <strong>第六条 保证</strong>
        </h2>
        <p>
          1.
          甲方按现状提供软件。甲方并未就软件的准确性、可靠性、完整性、适销性、特定目的性或非侵权性，向乙方作出任何明示或暗示的声明或保证，且不对乙方使用、参考软件而引起的任何损害承担任何责任。除了向乙方交付的软件外，甲方不因本协议对乙方产生其他任何义务和责任。
          <br />
          2.
          甲方不提供与任何开源软件有关的或软件中可能使用的，集成的或与共同提供的第三方技术有关的任何保证。乙方同意只能向第三方寻求有关第三方技术的全部保证。
        </p>
        <h2>
          <strong>第七条 赔偿</strong>
        </h2>
        <p>
          1.
          乙方对软件的救济以及甲方对授权的软件唯一的责任是，甲方有权选择去更新，替换引起纠纷的软件。
          <br />
          2.
          乙方必须保护甲方免于遭受因乙方不能遵守本协议使用软件的约定，或未经授权使用软件、发布软件、对软件进行修改或形成衍生作品，和/或在软件本身不侵权的前提下，将软件及其修改、衍生作品与乙方的产品结合而产生的任何索赔，赔偿，损失和责任。
        </p>
        <h2>
          <strong>第八条 保密信息、对外宣传</strong>
        </h2>
        <p>
          1.
          未经披露方允许，接受保密信息的一方（“接收方”）必须对所接触到的对方的(“披露方”)保密信息进行严格保密。未经对方书面许可不得向任何第三方以任何形式进行披露，也不得将属于披露方的任何保密信息用于本协议目的之外。接收方应妥善保管披露方提供的保密信息。
          <br />
          2.
          接收方对披露方所提供的保密信息承担保密义务。本协议履行完毕后，除双方另有约定外，接收方应按披露方要求退还或者删除披露方所提供的保密信息（含复印留用件）。
          <br />
          3.
          如下信息不受此限：已成为公知信息，而接收方对此并无过错；披露时接收方已经知晓的信息；接收方从第三方合法获得的信息，且未附加保密的义务；接收方并未使用保密信息，而自行研发获得的信息；
          披露方事先书面同意披露或使用的信息。
          <br /> 4.
          一方发现保密信息发生泄露等事故时，应立即告知对方，经双方协商后采取合理的对策。另外，由于一方的故意或过失造成保密信息泄露时，该方须承担由此给另一方造成的直接经济损失，且须及时采取必要的措施将对方损失控制在最小限度内，并自行承担因此发生的费用和责任。
          <br />
          5.
          本第八条的保密义务对外宣传义务在本协议终止后继续有效，直至保密信息被披露方公开。
          <br />
          6.
          未经对方事先书面同意，任何一方不得将本协议有关的内容进行对外公开、宣传和发表书面声明。如果就特定事宜需要进行对外公开、宣传和发表公开言论，需事先双方同意并书面确认对外公开、宣传内容。
        </p>
        <h2>
          <strong>第九条 转让</strong>
        </h2>
        <p>
          1.
          未经甲方书面同意，乙方不得将本合同项下的全部或部分权利义务转让给本合同以外第三方。
        </p>
        <h2>
          <strong>第十条 协议期限与终止</strong>
        </h2>
        <p>
          1.
          本协议有效期限自从本协议生效之日起与许可期限到期之日起终止。双方协商一致后可延长本协议期限。
          <br />
          2.
          如发生下列情形之一，本协议期限可提前终止：双方协商一致提前终止的；乙方若有违反本协议任何约定的，甲方有权立即终止本协议。
          <br />
          3.
          本协议终止时，甲方有权选择要求乙方归还或删除与软件及与软件有关的任何文件，并向甲方书面确认乙方已经完成上述行为。
        </p>
        <h2>
          <strong>第十一条 其他</strong>
        </h2>
        <p>
          1.
          本协议适用中华人民共和国法律。因本协议产生的或与本协议有关的任何纠纷或争议，双方应首先通过友好协商解决，若协商不成，任何一方均有权将纠纷或争议提交甲方所在地有管辖权的人民法院管辖。
          <br />
          2.
          甲方与乙方签订本协议，不视为双方之间因此形成代理、保证、合伙等法律关系。
        </p>
      </div>
    </Modal>
  );
}